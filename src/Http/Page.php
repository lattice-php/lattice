<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

use BackedEnum;
use BadMethodCallException;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Lattice\Lattice\Core\Contracts\PageContract;
use Lattice\Lattice\Core\PageMetadata;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Realtime\Listen;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Enums\PageContainer;
use Lattice\Lattice\Ui\Enums\PageLayout;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use UnexpectedValueException;

abstract class Page implements PageContract, Responsable
{
    public function title(): ?string
    {
        return null;
    }

    /**
     * @return array<int, array{title: string, href: string}>
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
     * Resolve the page's layout at request time. Returning a non-null value
     * takes precedence over the #[AsPage] attribute; null defers to it.
     */
    public function layout(): PageLayout|string|null
    {
        return null;
    }

    /**
     * Resolve the page's container at request time. Returning a non-null value
     * takes precedence over the #[AsPage] attribute; null defers to it.
     */
    public function container(): PageContainer|string|null
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

        abort_unless($this->authorize(app(Request::class)), 403);

        return $this->pageResponse($method, $this->{$method}(...array_values($parameters)));
    }

    /**
     * @param  Request  $request
     */
    public function toResponse($request): HttpResponse
    {
        abort_unless($this->authorize($request), 403);

        // schema is passed so the container resolves render()'s other
        // dependencies but does not rebuild PageSchema itself; the route's
        // (already-bound) parameters are merged so route arguments and model
        // binding resolve exactly as they do on the [Page, 'render'] path.
        $parameters = ['schema' => PageSchema::make()] + ($request->route()?->parameters() ?? []);

        $schema = app()->call([$this, 'render'], $parameters);

        return $this->pageResponse('render', $schema)->toResponse($request);
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
        $container = $this->container() ?? $metadata->container;

        $payload = new PagePayload(
            title: $this->title(),
            layout: $this->resolveLayout($layout, $request),
            container: $this->serializePageMetadata($container),
            breadcrumbs: array_map(
                static fn (array $breadcrumb): Breadcrumb => new Breadcrumb($breadcrumb['title'], $breadcrumb['href']),
                $this->breadcrumbs(),
            ),
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
