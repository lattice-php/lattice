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
     * Discovery groups keyed by group name. Registration is the only way to add a
     * kind: core registers its built-ins from `LatticeServiceProvider`, and
     * packages/apps register theirs the same way. Keyed by group so a provider
     * that boots more than once (as in the test suite) stays idempotent.
     *
     * @var array<string, class-string<DefinitionAttribute>>
     */
    private static array $registered = [];

    /**
     * Register a discovery group so `DiscoveryManifest` scans for its marker
     * attribute.
     *
     * @param  class-string<DefinitionAttribute>  $attributeClass
     */
    public static function register(string $group, string $attributeClass): void
    {
        self::$registered[$group] = $attributeClass;
    }

    /**
     * The registered discovery groups.
     *
     * @return array<string, class-string<DefinitionAttribute>>
     */
    public static function components(): array
    {
        return self::$registered;
    }

    /**
     * Drop all registrations. Intended for test isolation; providers re-register
     * on the next boot.
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
