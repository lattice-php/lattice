<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Core\Components\FloatingPanel;
use Lattice\Lattice\Core\Components\RawBlock;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\FloatingPlacement;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Core\Enums\Justify;
use Lattice\Lattice\Core\Enums\Orientation;
use Lattice\Lattice\Core\Enums\Placement;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Breadcrumbs;
use Lattice\Lattice\Layouts\Components\Dropdown;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\Components\Sidebar;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Workbench\App\Actions\SetLocaleAction;
use Workbench\App\Pages\BuilderTableDemoPage;
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
        $locale = app()->getLocale();

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
                                    MenuItem::fromPage(HomePage::class)->key('home')->label(__('workbench.navigation.home'))->icon('house'),
                                    MenuItem::make(__('workbench.navigation.forms'), 'forms')->icon('form-input')->children([
                                        MenuItem::fromPage(ShowcasePage::class)->key('showcase')->label(__('workbench.navigation.showcase')),
                                        MenuItem::fromPage(DependentDemoPage::class)->key('dependent-fields')->label(__('workbench.navigation.dependent-fields')),
                                        MenuItem::fromPage(BuilderTableDemoPage::class)->key('builder-table-demo')->label(__('workbench.navigation.builder-table-demo')),
                                        MenuItem::fromPage(ProductCreatePage::class)->key('create-product')->label(__('workbench.navigation.create-product')),
                                    ]),
                                    MenuItem::make(__('workbench.navigation.tables'), 'tables')->icon(Icon::Table)->children([
                                        MenuItem::fromPage(ProductsPage::class)->key('products')->label(__('workbench.navigation.products')),
                                        MenuItem::fromPage(TablesPage::class)->key('pagination-modes')->label(__('workbench.navigation.pagination-modes')),
                                    ]),
                                    MenuItem::fromPage(TabsPage::class)->key('tabs')->label(__('workbench.navigation.tabs'))->icon('spark'),
                                ]),
                                Dropdown::make('user-menu')
                                    ->placement(Placement::Top)
                                    ->trigger([
                                        Stack::make('user-menu-trigger')
                                            ->direction('row')
                                            ->schema([
                                                RawBlock::make('user-menu-avatar')->html('<span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-lt-muted text-xs font-medium text-lt-fg">WU</span>'),
                                                RawBlock::make('user-menu-identity')
                                                    ->html('<span class="grid min-w-0 text-left"><span class="truncate text-sm font-medium text-lt-fg">Workbench User</span><span class="truncate text-xs text-lt-muted-fg">dev@example.com</span></span>')
                                                    ->hideWhenCollapsed(),
                                            ]),
                                    ])
                                    ->items([
                                        MenuItem::make(__('workbench.navigation.log-out'), 'log-out')->href('/logout')->method(HttpMethod::Post),
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
            FloatingPanel::make('locale-switcher-panel')
                ->label(__('workbench.language.label'))
                ->placement(FloatingPlacement::TopEnd)
                ->schema([
                    ActionGroup::make('locale-switcher')
                        ->label(__('workbench.language.label'))
                        ->inline(Orientation::Horizontal)
                        ->actions([
                            ActionComponent::use(SetLocaleAction::class)
                                ->key('locale-en')
                                ->label(__('workbench.language.en'))
                                ->variant($locale === 'en' ? ButtonVariant::Secondary : ButtonVariant::Ghost)
                                ->context(['locale' => 'en']),
                            ActionComponent::use(SetLocaleAction::class)
                                ->key('locale-de')
                                ->label(__('workbench.language.de'))
                                ->variant($locale === 'de' ? ButtonVariant::Secondary : ButtonVariant::Ghost)
                                ->context(['locale' => 'de']),
                        ]),
                ]),
        ]);
    }
}
