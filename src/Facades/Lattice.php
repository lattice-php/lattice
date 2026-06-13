<?php
declare(strict_types=1);

namespace Lattice\Lattice\Facades;

use Illuminate\Support\Facades\Facade;
use Lattice\Lattice\LatticeRegistry;

/**
 * @method static void forms(class-string<\Lattice\Lattice\Forms\FormDefinition>|array<int, class-string<\Lattice\Lattice\Forms\FormDefinition>> $forms)
 * @method static void tables(class-string<\Lattice\Lattice\Tables\TableDefinition>|array<int, class-string<\Lattice\Lattice\Tables\TableDefinition>> $tables)
 * @method static void fragments(class-string<\Lattice\Lattice\Fragments\FragmentDefinition>|array<int, class-string<\Lattice\Lattice\Fragments\FragmentDefinition>> $fragments)
 * @method static void layouts(class-string<\Lattice\Lattice\Layouts\LayoutDefinition>|array<int, class-string<\Lattice\Lattice\Layouts\LayoutDefinition>> $layouts)
 * @method static \Lattice\Lattice\Layouts\LayoutRegistry layoutRegistry()
 * @method static void actions(class-string<\Lattice\Lattice\Actions\ActionDefinition>|array<int, class-string<\Lattice\Lattice\Actions\ActionDefinition>> $actions)
 * @method static void bulkActions(class-string<\Lattice\Lattice\Actions\BulkActionDefinition>|array<int, class-string<\Lattice\Lattice\Actions\BulkActionDefinition>> $bulkActions)
 * @method static void pages(class-string|array<int, class-string> $pages)
 * @method static void registerConfiguredDefinitions()
 * @method static void registerConfiguredPages()
 * @method static void discover(string $path, string $namespace)
 * @method static void discoverPages(string $path, string $namespace)
 *
 * @see LatticeRegistry
 */
final class Lattice extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return LatticeRegistry::class;
    }
}
