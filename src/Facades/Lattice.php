<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Facades;

use Bambamboole\Lattice\LatticeRegistry;
use Bambamboole\Lattice\Sidebar\SidebarRegistry;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void forms(class-string<\Bambamboole\Lattice\Forms\FormDefinition>|array<int, class-string<\Bambamboole\Lattice\Forms\FormDefinition>> $forms)
 * @method static void tables(class-string<\Bambamboole\Lattice\Tables\TableDefinition>|array<int, class-string<\Bambamboole\Lattice\Tables\TableDefinition>> $tables)
 * @method static void fragments(class-string<\Bambamboole\Lattice\Fragments\FragmentDefinition>|array<int, class-string<\Bambamboole\Lattice\Fragments\FragmentDefinition>> $fragments)
 * @method static void actions(class-string<\Bambamboole\Lattice\Actions\ActionDefinition>|array<int, class-string<\Bambamboole\Lattice\Actions\ActionDefinition>> $actions)
 * @method static void discover(string $path, string $namespace)
 * @method static SidebarRegistry sidebar()
 * @method static \Illuminate\Routing\Route page(string $uri, string $page)
 *
 * @see LatticeRegistry
 */
class Lattice extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return LatticeRegistry::class;
    }
}
