<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Discovery;

use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Attributes\BulkAction;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Attributes\Table;
use Spatie\Attributes\Attributes;

final class DiscoveryKinds
{
    /** @var array<string, class-string> */
    public const array COMPONENTS = [
        'forms' => Form::class,
        'tables' => Table::class,
        'actions' => Action::class,
        'bulk-actions' => BulkAction::class,
        'fragments' => Fragment::class,
        'layouts' => Layout::class,
    ];

    public const string PAGE_ATTRIBUTE = Page::class;

    /**
     * @param  class-string  $class
     * @param  class-string  $attributeClass
     */
    public static function keyOf(string $class, string $attributeClass): string
    {
        return Attributes::get($class, $attributeClass)->key;
    }
}
