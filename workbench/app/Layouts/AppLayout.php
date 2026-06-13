<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Core\Enums\Justify;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Breadcrumbs;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\Components\Sidebar;
use Lattice\Lattice\Layouts\Components\UserMenu;
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
                ->schema([
                    Sidebar::make('app-sidebar')->collapsible()->items([
                        Stack::make('sidebar-body')
                            ->width(Width::Fill)
                            ->justify(Justify::Between)
                            ->schema([
                                Menu::make('sidebar')->items([
                                    MenuItem::fromPage(HomePage::class)->label('Home')->icon('house'),
                                    MenuItem::make('Forms')->icon('form-input')->children([
                                        MenuItem::fromPage(ShowcasePage::class)->label('Showcase'),
                                        MenuItem::fromPage(DependentDemoPage::class)->label('Dependent Fields'),
                                        MenuItem::fromPage(ProductCreatePage::class)->label('Create Product'),
                                    ]),
                                    MenuItem::make('Tables')->icon(Icon::Table)->children([
                                        MenuItem::fromPage(ProductsPage::class)->label('Products'),
                                        MenuItem::fromPage(TablesPage::class)->label('Pagination Modes'),
                                    ]),
                                    // A fully custom icon (workbench/resources/icons/spark.svg) the
                                    // workbench adds to its own folder and references by name.
                                    MenuItem::fromPage(TabsPage::class)->label('Tabs')->icon('spark'),
                                ]),
                                UserMenu::make()
                                    ->name('Workbench User')
                                    ->email('dev@example.com')
                                    ->items([
                                        MenuItem::make('Log out')->href('/logout')->method(HttpMethod::Post),
                                    ]),
                            ]),
                    ]),
                    Stack::make('app-main')
                        ->width(Width::Fill)
                        ->schema([
                            Breadcrumbs::make(),
                            Outlet::make(),
                        ]),
                ]),
        ]);
    }
}
