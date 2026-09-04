<?php
declare(strict_types=1);

namespace Lattice\Http;

use BackedEnum;
use BadMethodCallException;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Lattice\Core\Authorization;
use Lattice\Core\Breadcrumb;
use Lattice\Core\Contracts\PageContract;
use Lattice\Core\Contracts\ResolvesGateSubject;
use Lattice\Core\Enums\PageLayout;
use Lattice\Core\Enums\PageWidth;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\PageMetadata;
use Lattice\Core\Services\ContextResolvers;
use Lattice\Core\Services\ContextScope;
use Lattice\Core\Support\Wire;
use Lattice\Http\Middleware\AuthorizeGateSubject;
use Lattice\Realtime\Listen;
use Lattice\Support\GateSubjects;
use Lattice\Ui\BreadcrumbTrail;
use Lattice\Ui\PageSchema;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use UnexpectedValueException;

/**
 * @method PageSchema render(mixed ...$parameters)
 */
abstract class Page implements PageContract, ResolvesGateSubject, Responsable
{
    public function title(): ?string
    {
        return null;
    }

    /**
     * @return array<int, Breadcrumb>
     */
    public function breadcrumbs(): array
    {
        return [];
    }

    /**
     * @return array<int, Listen>
     */
    protected function listeners(): array
    {
        return [];
    }

    public function authorize(Request $request): bool
    {
        return true;
    }

    /**
     * The `on` gate subject: the named route parameter as bound by
     * `SubstituteBindings`, or — for a scalar, unbound value — resolved
     * through a `Lattice::context()` resolver registered under the same key.
     * A parameter that is neither yields no subject, so the gate denies.
     * Shared with {@see AuthorizeGateSubject}, the
     * `can:{ability},{on}` route middleware, via {@see GateSubjects}, so the
     * two never resolve the same key differently.
     */
    public function gateSubject(string $key): ?object
    {
        return GateSubjects::fromRoute(app(Request::class), $key);
    }

    /**
     * Resolve the page's layout at request time. Returning a non-null value
     * takes precedence over the #[AsPage] attribute; null defers to it.
     */
    public function layout(): PageLayout|string|null
    {
        return null;
    }

    /**
     * Resolve the page's width at request time. Returning a non-null value
     * takes precedence over the #[AsPage] attribute; null defers to it.
     */
    public function width(): ?PageWidth
    {
        return null;
    }

    /**
     * Laravel's ControllerDispatcher invokes this (via method_exists) for every
     * `[$page, 'render']` route, so the route path authorizes and converts the
     * returned PageSchema here; it is never called with user-supplied input.
     *
     * @param  array<int, mixed>  $parameters
     */
    public function callAction(string $method, array $parameters): Response
    {
        if (! method_exists($this, $method)) {
            throw new BadMethodCallException(sprintf(
                'Method %s::%s does not exist.',
                static::class,
                $method,
            ));
        }

        $request = app(Request::class);

        Authorization::ensure($this, $request);
        app(ContextScope::class)->activate($this->contextFrame($request));

        return $this->pageResponse($method, $this->{$method}(...array_values($parameters)));
    }

    /**
     * @param  Request  $request
     */
    public function toResponse($request): HttpResponse
    {
        Authorization::ensure($this, $request);
        app(ContextScope::class)->activate($this->contextFrame($request));

        // schema is passed so the container resolves render()'s other
        // dependencies but does not rebuild PageSchema itself; the route's
        // (already-bound) parameters are merged so route arguments and model
        // binding resolve exactly as they do on the [Page, 'render'] path.
        $parameters = ['schema' => PageSchema::make()] + ($request->route()?->parameters() ?? []);

        $schema = app()->call($this->render(...), $parameters);

        return $this->pageResponse('render', $schema)->toResponse($request);
    }

    /**
     * Seeds the page's `ContextScope` frame from the route's bound
     * parameters, by convention: an object parameter seeds the key a
     * `Lattice::context($key, Model::class)` resolver registered for its
     * class ({@see ContextResolvers::keyForModel()}) — so a route parameter
     * named `current_tenant` and bound to a `Tenant` still seeds `tenant` —
     * and a scalar parameter seeds the key sharing its own name, when that
     * name is itself registered. `PageSchema::context()` extends or
     * overrides this from `render()` for anything the convention misses.
     * Override this to change the convention for a page (or a whole base
     * page class).
     *
     * @return array<string, mixed>
     */
    protected function contextFrame(Request $request): array
    {
        $resolvers = app(ContextResolvers::class);
        $frame = [];

        foreach ($request->route()?->parameters() ?? [] as $name => $value) {
            if (is_object($value)) {
                $key = $resolvers->keyForModel($value);

                if ($key !== null) {
                    $frame[$key] = $value;
                }

                continue;
            }

            if (is_scalar($value) && $resolvers->has((string) $name)) {
                $frame[(string) $name] = $value;
            }
        }

        return $frame;
    }

    private function pageResponse(string $method, mixed $schema): Response
    {
        if (! $schema instanceof PageSchema) {
            throw new UnexpectedValueException(sprintf(
                'Method %s::%s must return an instance of %s.',
                static::class,
                $method,
                PageSchema::class,
            ));
        }

        return $this->response($schema);
    }

    protected function component(): string
    {
        return 'lattice/page';
    }

    /**
     * The realized `lattice` prop ({@see PagePayload} is its typed shape). The
     * component tree is realized eagerly here, inside the request lifecycle, so
     * serialization side effects (such as a Tabs confirmation redirect) fire
     * before the response view is rendered rather than during the final
     * json_encode.
     *
     * @return array<string, mixed>
     */
    public function toArray(PageSchema $schema, Request $request): array
    {
        $metadata = PageMetadata::for($this);
        $layout = $this->layout() ?? $metadata->layout;
        $width = $this->width() ?? $metadata->width;

        $breadcrumbs = $schema->resolvedBreadcrumbs() ?? $this->breadcrumbs();

        app(BreadcrumbTrail::class)->set($breadcrumbs);

        $payload = new PagePayload(
            title: $schema->resolvedTitle() ?? $this->title(),
            layout: $this->resolveLayout($layout, $request),
            width: $width,
            breadcrumbs: $breadcrumbs,
            schema: $schema->renderable(),
            listeners: $this->resolveListeners(),
        );

        return (array) Wire::toWire($payload);
    }

    /**
     * Resolve the page's layout: the layout key plus its rendered component
     * tree (containing an Outlet that marks where this page's content
     * renders). Returns null when the page opts out of a layout (rendered
     * standalone, e.g. centered auth screens).
     */
    private function resolveLayout(PageLayout|string $layout, Request $request): ?PageLayoutPayload
    {
        $key = $this->serializePageMetadata($layout);

        if ($key === '' || $key === PageLayout::None->value) {
            return null;
        }

        $rendered = Lattice::layoutRegistry()->render($key, $request);

        return new PageLayoutPayload($rendered['key'], $rendered['schema']);
    }

    /**
     * @return array<int, Listen>
     */
    private function resolveListeners(): array
    {
        if (! config('lattice.realtime.enabled', true)) {
            return [];
        }

        return array_values($this->listeners());
    }

    private function response(PageSchema $schema): Response
    {
        return Inertia::render($this->component(), [
            'lattice' => $this->toArray($schema, app(Request::class)),
        ]);
    }

    private function serializePageMetadata(BackedEnum|string $value): string
    {
        return Wire::scalar($value);
    }
}
