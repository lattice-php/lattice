<?php

declare(strict_types=1);

namespace Lattice\Lattice\Http;

use Lattice\Lattice\Attributes\Page as PageAttribute;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use ReflectionClass;

final class PageMetadata
{
    /**
     * @param  array<int, string>  $middleware
     */
    private function __construct(
        public readonly ?string $route,
        public readonly string $name,
        public readonly PageLayout|string $layout,
        public readonly PageContainer|string $container,
        public readonly array $middleware,
    ) {}

    public static function for(Page|string $page): self
    {
        $class = is_object($page) ? $page::class : $page;

        $own = self::attributeOn($class);

        return new self(
            route: $own?->route,
            name: self::resolveName($class, $own),
            layout: self::inherited($class, fn (PageAttribute $a) => $a->layout) ?? PageLayout::None,
            container: self::inherited($class, fn (PageAttribute $a) => $a->container) ?? PageContainer::Centered,
            middleware: (array) (self::inherited($class, fn (PageAttribute $a) => $a->middleware) ?? []),
        );
    }

    private static function attributeOn(string $class): ?PageAttribute
    {
        $attributes = (new ReflectionClass($class))->getAttributes(PageAttribute::class);

        return $attributes === [] ? null : $attributes[0]->newInstance();
    }

    /**
     * @param  callable(PageAttribute): (PageLayout|PageContainer|array<int,string>|string|null)  $value
     */
    private static function inherited(string $class, callable $value): mixed
    {
        for ($current = $class; $current !== false; $current = get_parent_class($current)) {
            $attribute = self::attributeOn($current);

            if ($attribute !== null && ($resolved = $value($attribute)) !== null) {
                return $resolved;
            }
        }

        return null;
    }

    private static function resolveName(string $class, ?PageAttribute $own): string
    {
        if ($own?->name !== null) {
            return $own->name;
        }

        $route = $own !== null ? ($own->route ?? '') : '';

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
