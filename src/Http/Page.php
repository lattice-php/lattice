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
     * @return array{title: string|null, layout: array{key: string, schema: array<int, array<string, mixed>>}|null, container: string, breadcrumbs: array<int, array{title: string, href: string}>, menus: array<string, array{groups: array<int, array{label: string|null, items: array<int, array{active: bool, href: string, icon: string|null, key: string, label: string, method: string}>}>}>, schema: array<int, array<string, mixed>>}
     */
    public function toArray(PageSchema $schema, ?Request $request = null): array
    {
        return [
            'title' => $this->title(),
            'layout' => $this->resolveLayout($request),
            'container' => $this->serializePageMetadata($this->container()),
            'breadcrumbs' => $this->breadcrumbs(),
            'menus' => $request instanceof Request
                ? Lattice::menus()->toArray($request)
                : [],
            'schema' => $this->serializeSchema($schema),
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
    private function resolveLayout(?Request $request): ?array
    {
        $key = $this->serializePageMetadata($this->layout());

        if ($key === '' || $key === PageLayout::None->value) {
            return null;
        }

        $rendered = Lattice::layoutRegistry()->render($key, $request ?? app(Request::class));

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
