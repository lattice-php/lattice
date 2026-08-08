<?php
declare(strict_types=1);

namespace Lattice\Core\Facades;

use Illuminate\Support\Facades\Facade;
use Lattice\Core\LatticeRegistry;

/**
 * @method static void forms(class-string<\Lattice\Form\FormDefinition>|array<int, class-string<\Lattice\Form\FormDefinition>> $forms)
 * @method static void tables(class-string<\Lattice\Table\TableDefinition>|array<int, class-string<\Lattice\Table\TableDefinition>> $tables)
 * @method static void fragments(class-string<\Lattice\Fragments\FragmentDefinition>|array<int, class-string<\Lattice\Fragments\FragmentDefinition>> $fragments)
 * @method static void layouts(class-string<\Lattice\Layouts\LayoutDefinition>|array<int, class-string<\Lattice\Layouts\LayoutDefinition>> $layouts)
 * @method static \Lattice\Layouts\LayoutRegistry layoutRegistry()
 * @method static void pages(class-string<\Lattice\Core\Contracts\PageContract>|array<int, class-string<\Lattice\Core\Contracts\PageContract>> $pages)
 * @method static \Lattice\Http\PageRegistry pageRegistry()
 * @method static void actions(class-string<\Lattice\Actions\ActionDefinition>|array<int, class-string<\Lattice\Actions\ActionDefinition>> $actions)
 * @method static void bulkActions(class-string<\Lattice\Actions\BulkActionDefinition>|array<int, class-string<\Lattice\Actions\BulkActionDefinition>> $bulkActions)
 * @method static void remoteSources(class-string<\Lattice\Remote\RemoteSourceDefinition>|array<int, class-string<\Lattice\Remote\RemoteSourceDefinition>> $remoteSources)
 * @method static void remoteSourceResolver(callable $resolver)
 * @method static \Lattice\Remote\RemoteSourceRegistry remoteSourceRegistry()
 * @method static void extend(string $name, \Closure $factory, int $priority = 0)
 * @method static void theme(\Lattice\Theme\Theme|\Closure $theme)
 * @method static void translations(string $namespace, string $path)
 * @method static void wireFamily(string $category, class-string<\Lattice\Core\Attributes\WireType> $attribute, class-string $reference, bool $marker = false)
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
