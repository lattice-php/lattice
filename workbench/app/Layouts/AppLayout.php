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
use Workbench\App\Pages\DependentDemoPage;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\ProductCreatePage;
use Workbench\App\Pages\ProductsPage;
use Workbench\App\Pages\ShowcasePage;
use Workbench\App\Pages\TablesPage;
use Workbench\App\Pages\TabsPage;

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
                                MenuItem::fromPage(HomePage::class)->label('Home')->icon(LucideIcon::House),
                                MenuItem::make('Forms')->icon(LucideIcon::FormInput)->children([
                                    MenuItem::fromPage(ShowcasePage::class)->label('Showcase'),
                                    MenuItem::fromPage(DependentDemoPage::class)->label('Dependent Fields'),
                                    MenuItem::fromPage(ProductCreatePage::class)->label('Create Product'),
                                ]),
                                MenuItem::make('Tables')->icon(LucideIcon::Table)->children([
                                    MenuItem::fromPage(ProductsPage::class)->label('Products'),
                                    MenuItem::fromPage(TablesPage::class)->label('Pagination Modes'),
                                ]),
                                MenuItem::fromPage(TabsPage::class)->label('Tabs')->icon(LucideIcon::PanelsTopLeft),
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
