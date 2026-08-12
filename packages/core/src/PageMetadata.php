<?php

declare(strict_types=1);

namespace Lattice\Core;

use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Contracts\PageContract;
use Lattice\Core\Enums\PageLayout;
use Lattice\Core\Enums\PageWidth;
use Lattice\Core\Support\Wire;
use Spatie\Attributes\Attributes;

final readonly class PageMetadata
{
    /**
     * `$middleware` holds only what the class hierarchy declares (null when
     * nothing does) — the route merges it after the `lattice.pages.middleware`
     * default at registration time, so the default applies everywhere.
     *
     * @param  class-string  $class
     * @param  array<int, string>|null  $middleware
     * @param  array<int, string>  $can
     */
    private function __construct(
        public string $class,
        public ?string $route,
        public string $name,
        public PageLayout|string $layout,
        public PageWidth|string $width,
        public ?array $middleware,
        public array $can,
    ) {}

    /** @param  PageContract|class-string<PageContract>  $page */
    public static function for(PageContract|string $page): self
    {
        return app(PageMetadataResolver::class)->for($page);
    }

    /** @param  PageContract|class-string<PageContract>  $page */
    public static function reflect(PageContract|string $page): self
    {
        $class = is_object($page) ? $page::class : $page;

        $own = self::attributeOn($class);

        return new self(
            class: $class,
            route: $own?->route,
            name: self::resolveName($class, $own),
            layout: self::inherited($class, fn (AsPage $a): PageLayout|string|null => $a->layout) ?? PageLayout::None,
            width: self::inherited($class, fn (AsPage $a): PageWidth|string|null => $a->width) ?? PageWidth::Full,
            middleware: self::inheritedMiddleware($class),
            can: $own?->can() ?? [],
        );
    }

    /**
     * @param  class-string<PageContract>  $class
     * @return array<int, string>|null
     */
    private static function inheritedMiddleware(string $class): ?array
    {
        $middleware = self::inherited($class, fn (AsPage $a): string|array|null => $a->middleware);

        return $middleware === null ? null : (array) $middleware;
    }

    /**
     * @return array{class: class-string, route: string|null, name: string, middleware: array<int, string>|null, layout: string, width: string, can: array<int, string>}
     */
    public function toArray(): array
    {
        return [
            'class' => $this->class,
            'route' => $this->route,
            'name' => $this->name,
            'middleware' => $this->middleware,
            'layout' => $this->serialize($this->layout),
            'width' => $this->serialize($this->width),
            'can' => $this->can,
        ];
    }

    /**
     * `can` defaults for descriptors cached by a manifest built before it
     * existed, so an upgrade works without regenerating the discovery cache.
     *
     * @param  array{class: class-string, route: string|null, name: string, middleware: array<int, string>|null, layout: string, width: string, can?: array<int, string>}  $descriptor
     */
    public static function fromArray(array $descriptor): self
    {
        return new self(
            class: $descriptor['class'],
            route: $descriptor['route'],
            name: $descriptor['name'],
            layout: $descriptor['layout'],
            width: $descriptor['width'],
            middleware: $descriptor['middleware'],
            can: $descriptor['can'] ?? [],
        );
    }

    private function serialize(PageLayout|PageWidth|string $value): string
    {
        return Wire::scalar($value);
    }

    /** @param  class-string  $class */
    private static function attributeOn(string $class): ?AsPage
    {
        return Attributes::get($class, AsPage::class);
    }

    /**
     * @param  class-string<PageContract>  $class
     * @param  callable(AsPage): (PageLayout|PageWidth|array<int,string>|string|null)  $value
     */
    private static function inherited(string $class, callable $value): mixed
    {
        for ($current = $class; $current !== false; $current = get_parent_class($current)) {
            $attribute = self::attributeOn($current);

            if ($attribute instanceof AsPage && ($resolved = $value($attribute)) !== null) {
                return $resolved;
            }
        }

        return null;
    }

    private static function resolveName(string $class, ?AsPage $own): string
    {
        if ($own?->name !== null) {
            return $own->name;
        }

        $route = $own instanceof AsPage ? ($own->route ?? '') : '';

        $segments = array_filter(
            explode('/', $route),
            static fn (string $segment): bool => $segment !== '' && ! str_starts_with($segment, '{'),
        );

        if ($segments !== []) {
            return implode('.', $segments);
        }

        return str(class_basename($class))->beforeLast('Page')->kebab()->toString();
    }
}
