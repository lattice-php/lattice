<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core;

use BackedEnum;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Contracts\PageContract;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use ReflectionClass;

final readonly class PageMetadata
{
    /**
     * @param  class-string  $class
     * @param  array<int, string>  $middleware
     */
    private function __construct(
        public string $class,
        public ?string $route,
        public string $name,
        public PageLayout|string $layout,
        public PageContainer|string $container,
        public array $middleware,
    ) {}

    public static function for(PageContract|string $page): self
    {
        $class = is_object($page) ? $page::class : $page;

        $manifest = app(DiscoveryManifest::class);

        if ($manifest->isCached()) {
            $descriptor = $manifest->descriptorFor($class);

            if ($descriptor !== null) {
                return self::fromArray($descriptor);
            }
        }

        return self::reflect($class);
    }

    public static function reflect(PageContract|string $page): self
    {
        $class = is_object($page) ? $page::class : $page;

        $own = self::attributeOn($class);

        return new self(
            class: $class,
            route: $own?->route,
            name: self::resolveName($class, $own),
            layout: self::inherited($class, fn (AsPage $a): PageLayout|string|null => $a->layout) ?? PageLayout::None,
            container: self::inherited($class, fn (AsPage $a): PageContainer|string|null => $a->container) ?? PageContainer::Centered,
            middleware: (array) (self::inherited($class, fn (AsPage $a): string|array|null => $a->middleware) ?? []),
        );
    }

    /**
     * @return array{class: class-string, route: string|null, name: string, middleware: array<int, string>, layout: string, container: string}
     */
    public function toArray(): array
    {
        return [
            'class' => $this->class,
            'route' => $this->route,
            'name' => $this->name,
            'middleware' => $this->middleware,
            'layout' => $this->serialize($this->layout),
            'container' => $this->serialize($this->container),
        ];
    }

    /**
     * @param  array{class: class-string, route: string|null, name: string, middleware: array<int, string>, layout: string, container: string}  $descriptor
     */
    public static function fromArray(array $descriptor): self
    {
        return new self(
            class: $descriptor['class'],
            route: $descriptor['route'],
            name: $descriptor['name'],
            layout: $descriptor['layout'],
            container: $descriptor['container'],
            middleware: $descriptor['middleware'],
        );
    }

    private function serialize(PageLayout|PageContainer|string $value): string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }

    private static function attributeOn(string $class): ?AsPage
    {
        $attributes = new ReflectionClass($class)->getAttributes(AsPage::class);

        return $attributes === [] ? null : $attributes[0]->newInstance();
    }

    /**
     * @param  callable(AsPage): (PageLayout|PageContainer|array<int,string>|string|null)  $value
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
