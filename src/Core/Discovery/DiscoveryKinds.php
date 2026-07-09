<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Discovery;

use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Attributes\AsRemoteSource;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Spatie\Attributes\Attributes;

final class DiscoveryKinds
{
    /** @var array<string, class-string> */
    public const array COMPONENTS = [
        'forms' => AsForm::class,
        'tables' => AsTable::class,
        'actions' => AsAction::class,
        'bulk-actions' => AsBulkAction::class,
        'fragments' => AsFragment::class,
        'remote-sources' => AsRemoteSource::class,
        'layouts' => AsLayout::class,
    ];

    public const string PAGE_ATTRIBUTE = AsPage::class;

    /**
     * Discovery groups contributed at runtime, keyed by group so a provider that
     * boots more than once (as in the test suite) stays idempotent.
     *
     * @var array<string, class-string<DefinitionAttribute>>
     */
    private static array $registered = [];

    /**
     * Register an additional discovery group so `DiscoveryManifest` scans for its
     * marker attribute. Call this from a package or app service provider to make a
     * new `DefinitionRegistry` kind discoverable without editing core.
     *
     * @param  class-string<DefinitionAttribute>  $attributeClass
     */
    public static function register(string $group, string $attributeClass): void
    {
        self::$registered[$group] = $attributeClass;
    }

    /**
     * The built-in groups plus any registered at runtime.
     *
     * @return array<string, class-string>
     */
    public static function components(): array
    {
        return [...self::COMPONENTS, ...self::$registered];
    }

    /**
     * Drop all runtime registrations. Intended for test isolation.
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
