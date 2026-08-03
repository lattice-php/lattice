<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Discovery;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Spatie\Attributes\Attributes;

final class DiscoveryKinds
{
    public const string PAGE_ATTRIBUTE = AsPage::class;

    /**
     * Keyed by group so re-registering on each provider boot stays idempotent.
     *
     * @var array<string, class-string<DefinitionAttribute>>
     */
    private static array $registered = [];

    /**
     * @param  class-string<DefinitionAttribute>  $attributeClass
     */
    public static function register(string $group, string $attributeClass): void
    {
        self::$registered[$group] = $attributeClass;
    }

    /**
     * @return array<string, class-string<DefinitionAttribute>>
     */
    public static function components(): array
    {
        return self::$registered;
    }

    /**
     * For test isolation; providers re-register on the next boot.
     */
    public static function flush(): void
    {
        self::$registered = [];
    }

    /**
     * @param  class-string  $class
     * @param  class-string  $attributeClass
     */
    public static function keyOf(string $class, string $attributeClass): string
    {
        return Attributes::get($class, $attributeClass)->key;
    }
}
