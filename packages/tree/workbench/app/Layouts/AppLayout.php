<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\Components\Sidebar;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\StackDirection;
use Lattice\Lattice\Ui\Enums\Width;
use Workbench\App\Pages\ExpandedLazyTreePage;
use Workbench\App\Pages\LazyTreePage;
use Workbench\App\Pages\PlainPage;
use Workbench\App\Pages\SkeletonLazyTreePage;
use Workbench\App\Pages\TreePage;

#[AsLayout('app')]
final class AppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')
                ->direction(StackDirection::Row)
                ->gap(Gap::None)
                ->schema([
                    Sidebar::make('app-sidebar')->items([
                        Menu::make('sidebar')->items([
                            MenuItem::fromPage(TreePage::class)->key('tree')->label('Tree'),
                            MenuItem::fromPage(LazyTreePage::class)->key('tree-lazy')->label('Lazy tree'),
                            MenuItem::fromPage(ExpandedLazyTreePage::class)->key('tree-lazy-expanded')->label('Lazy, pre-expanded'),
                            MenuItem::fromPage(SkeletonLazyTreePage::class)->key('tree-lazy-skeleton')->label('Lazy skeleton'),
                            MenuItem::fromPage(PlainPage::class)->key('plain')->label('Plain'),
                        ]),
                    ]),
                    Stack::make('app-main')
                        ->width(Width::Fill)
                        ->schema([Outlet::make()]),
                ]),
        ]);
    }
}
