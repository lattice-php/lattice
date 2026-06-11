<?php

declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\LucideIcon;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\ProductsPage;
use Workbench\App\Pages\ShowcasePage;
use Workbench\App\Pages\TablesPage;

#[Layout('app')]
final class AppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')
                ->direction('row')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Stack::make('app-sidebar')
                        ->gap(Gap::Small)
                        ->schema([
                            Heading::make('Lattice', 2),
                            Menu::make('sidebar')->items([
                                MenuItem::fromPage(HomePage::class)->icon(LucideIcon::House),
                                MenuItem::fromPage(TablesPage::class)->icon(LucideIcon::Table),
                                MenuItem::fromPage(ProductsPage::class)->icon(LucideIcon::Package),
                                MenuItem::fromPage(ShowcasePage::class)->label('Form Showcase')->icon(LucideIcon::FormInput),
                            ]),
                        ]),
                    Stack::make('app-main')
                        ->schema([
                            Outlet::make(),
                        ]),
                ]),
        ]);
    }
}
