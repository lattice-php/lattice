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
use Lattice\Lattice\Attributes\AsSearchProvider;
use Lattice\Lattice\Attributes\AsTable;
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
        'global-search' => AsSearchProvider::class,
    ];

    public const string PAGE_ATTRIBUTE = AsPage::class;

    /**
     * @param  class-string  $class
     * @param  class-string  $attributeClass
     */
    public static function keyOf(string $class, string $attributeClass): string
    {
        return Attributes::get($class, $attributeClass)->key;
    }
}
