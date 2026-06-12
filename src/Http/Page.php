<?php

namespace Lattice\Lattice\Http;

use BackedEnum;
use BadMethodCallException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use UnexpectedValueException;

abstract class Page implements PageContract
{
    public function title(): ?string
    {
        return null;
    }

    public function layout(): PageLayout|string
    {
        return PageLayout::None;
    }

    public function container(): PageContainer|string
    {
        return PageContainer::Centered;
    }

    /**
     * @return array<int, array{title: string, href: string}>
     */
    public function breadcrumbs(): array
    {
        return [];
    }

    public function authorize(Request $request): bool
    {
        return true;
    }

    /**
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

        $schema = $this->{$method}(...array_values($parameters));

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
     * @return array{title: string|null, layout: array{key: string, schema: array<int, array<string, mixed>>}|null, container: string, breadcrumbs: array<int, array{title: string, href: string}>, schema: array<int, array<string, mixed>>, i18n: array{enabled: bool, saveMissing: bool}}
     */
    public function toArray(PageSchema $schema, Request $request): array
    {
        return [
            'title' => $this->title(),
            'layout' => $this->resolveLayout($request),
            'container' => $this->serializePageMetadata($this->container()),
            'breadcrumbs' => $this->breadcrumbs(),
            'schema' => $this->serializeSchema($schema),
            'i18n' => $this->i18nConfig(),
        ];
    }

    /**
     * Resolve the page's layout to its wire shape: the layout key plus its
     * realized schema (a component tree containing an Outlet that marks where
     * this page's content renders). Returns null when the page opts out of a
     * layout (rendered standalone, e.g. centered auth screens).
     *
     * @return array{key: string, schema: array<int, array<string, mixed>>}|null
     */
    private function resolveLayout(Request $request): ?array
    {
        $key = $this->serializePageMetadata($this->layout());

        if ($key === '' || $key === PageLayout::None->value) {
            return null;
        }

        $rendered = Lattice::layoutRegistry()->render($key, $request);

        return [
            'key' => $rendered['key'],
            'schema' => json_decode(json_encode($rendered['schema'], JSON_THROW_ON_ERROR), true),
        ];
    }

    /**
     * Realize the component tree to its wire array eagerly, inside the request
     * lifecycle, so serialization side effects (such as a Tabs confirmation
     * redirect) fire before the response view is rendered rather than during
     * the final json_encode.
     *
     * @return array<int, array<string, mixed>>
     */
    private function serializeSchema(PageSchema $schema): array
    {
        return json_decode(json_encode($schema->renderable(), JSON_THROW_ON_ERROR), true);
    }

    /**
     * i18n signals for the renderer, mirrored from laravel-i18next's config so it
     * stays the single source of truth. The frontend hardcodes the routes, so only
     * these travel: whether translations are served and whether missing keys are dumped.
     *
     * @return array{enabled: bool, saveMissing: bool}
     */
    private function i18nConfig(): array
    {
        return [
            'enabled' => (bool) config('i18next.routes.enabled', false),
            'saveMissing' => (bool) config('i18next.save_missing.enabled', false),
        ];
    }

    private function response(PageSchema $schema): Response
    {
        return Inertia::render($this->component(), [
            'lattice' => $this->toArray($schema, app(Request::class)),
        ]);
    }

    private function serializePageMetadata(BackedEnum|string $value): string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }
}
