<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\ChatBox;
use Lattice\Lattice\Core\Components\FloatingPanel;
use Lattice\Lattice\Core\Components\RawBlock;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\FloatingPlacement;
use Lattice\Lattice\Core\Enums\Gap;
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
use Workbench\App\Actions\ToggleChatLayoutAction;
use Workbench\App\Pages\BuilderTableDemoPage;
use Workbench\App\Pages\BusinessPartnersPage;
use Workbench\App\Pages\DependentDemoPage;
use Workbench\App\Pages\ExternalSchemaPage;
use Workbench\App\Pages\GroupsPage;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\ProductCreatePage;
use Workbench\App\Pages\ProductsPage;
use Workbench\App\Pages\SalesOrdersPage;
use Workbench\App\Pages\ShowcasePage;
use Workbench\App\Pages\TablesPage;
use Workbench\App\Pages\TabsPage;
use Workbench\App\Support\Logo;

#[AsLayout('app')]
class AppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')
                ->direction('row')
                ->schema([
                    $this->sidebar(),
                    Stack::make('app-main')
                        ->width(Width::Fill)
                        ->schema([
                            Breadcrumbs::make(),
                            Outlet::make(),
                            RawBlock::make('chat-scroll-clearance')->html('<div class="h-24" aria-hidden="true"></div>'),
                        ]),
                ]),
            $this->localeSwitcherPanel(),
            $this->chatLayoutTogglePanel(),
            FloatingPanel::make('assistant-chat')
                ->placement(FloatingPlacement::BottomEnd)
                ->trigger([
                    Badge::make(__('workbench.assistant.trigger')),
                ])
                ->schema([
                    $this->chatBox(),
                ]),
        ]);
    }

    protected function sidebar(): Sidebar
    {
        return Sidebar::make('app-sidebar')->collapsible()->items([
            Stack::make('sidebar-body')
                ->width(Width::Fill)
                ->justify(Justify::Between)
                ->schema([
                    Stack::make('sidebar-top')
                        ->gap(Gap::Large)
                        ->schema([
                            Stack::make('sidebar-brand')
                                ->direction('row')
                                ->align(Align::Center)
                                ->gap(Gap::Small)
                                ->schema([
                                    RawBlock::make('brand-mark')->html(Logo::mark('size-8 shrink-0')),
                                    RawBlock::make('brand-name')
                                        ->html('<span class="text-lg font-semibold tracking-tight text-lt-fg">Lattice</span>')
                                        ->hideWhenCollapsed(),
                                ]),
                            Menu::make('sidebar')->items([
                                MenuItem::fromPage(HomePage::class)->key('home')->label(__('workbench.navigation.home'))->icon('house'),
                                MenuItem::make(__('workbench.navigation.forms'), 'forms')->icon('form-input')->children([
                                    MenuItem::fromPage(ShowcasePage::class)->key('showcase')->label(__('workbench.navigation.showcase')),
                                    MenuItem::fromPage(DependentDemoPage::class)->key('dependent-fields')->label(__('workbench.navigation.dependent-fields')),
                                    MenuItem::fromPage(BuilderTableDemoPage::class)->key('builder-table-demo')->label(__('workbench.navigation.builder-table-demo')),
                                    MenuItem::fromPage(ProductCreatePage::class)->key('create-product')->label(__('workbench.navigation.create-product')),
                                ]),
                                MenuItem::make(__('workbench.navigation.commerce'), 'commerce')->icon('layout-dashboard')->children([
                                    MenuItem::fromPage(BusinessPartnersPage::class)->key('business-partners')->label(__('workbench.navigation.business-partners')),
                                    MenuItem::fromPage(GroupsPage::class)->key('groups')->label(__('workbench.navigation.groups')),
                                    MenuItem::fromPage(ProductsPage::class)->key('products')->label(__('workbench.navigation.products')),
                                    MenuItem::fromPage(SalesOrdersPage::class)->key('sales-orders')->label(__('workbench.navigation.sales-orders')),
                                ]),
                                MenuItem::make(__('workbench.navigation.tables'), 'tables')->icon(Icon::Table)->children([
                                    MenuItem::fromPage(TablesPage::class)->key('pagination-modes')->label(__('workbench.navigation.pagination-modes')),
                                ]),
                                MenuItem::fromPage(ExternalSchemaPage::class)->key('external-schema')->label(__('workbench.navigation.external-schema'))->icon('plug'),
                                MenuItem::fromPage(TabsPage::class)->key('tabs')->label(__('workbench.navigation.tabs'))->icon('spark'),
                            ]),
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
        ]);
    }

    protected function localeSwitcherPanel(FloatingPlacement $placement = FloatingPlacement::TopEnd): FloatingPanel
    {
        $locale = app()->getLocale();

        return FloatingPanel::make('locale-switcher-panel')
            ->label(__('workbench.language.label'))
            ->placement($placement)
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
            ]);
    }

    protected function chatLayoutTogglePanel(): FloatingPanel
    {
        $inline = (bool) session('workbench.chat_inline', false);

        return FloatingPanel::make('chat-layout-toggle-panel')
            ->label(__('workbench.chat-layout.label'))
            ->placement(FloatingPlacement::TopStart)
            ->schema([
                ActionComponent::use(ToggleChatLayoutAction::class)
                    ->key('chat-layout-toggle')
                    ->label($inline ? __('workbench.chat-layout.hide') : __('workbench.chat-layout.reveal')),
            ]);
    }

    protected function chatBox(): ChatBox
    {
        return ChatBox::make('assistant')
            ->streamEndpoint('/workbench/chat/stream')
            ->historyEndpoint('/workbench/chat/history')
            ->title(__('workbench.assistant.title'))
            ->placeholder(__('workbench.assistant.placeholder'));
    }
}
