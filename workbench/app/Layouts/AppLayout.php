<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
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
use Lattice\Lattice\Core\Enums\Placement;
use Lattice\Lattice\Core\Enums\Side;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Layouts\Components\Breadcrumbs;
use Lattice\Lattice\Layouts\Components\Dropdown;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\Components\Sidebar;
use Lattice\Lattice\Layouts\Components\Topbar;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Lattice\Lattice\Support\Affix;
use Workbench\App\Actions\SetLocaleAction;
use Workbench\App\Actions\ToggleChatLayoutAction;
use Workbench\App\Pages\BuilderTableDemoPage;
use Workbench\App\Pages\BusinessPartnersPage;
use Workbench\App\Pages\DependentDemoPage;
use Workbench\App\Pages\GroupsPage;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\ProductCreatePage;
use Workbench\App\Pages\ProductsPage;
use Workbench\App\Pages\RemoteSchemaPage;
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
                ->gap(Gap::None)
                ->schema([
                    $this->sidebar(),
                    Stack::make('app-main')
                        ->width(Width::Fill)
                        ->schema([
                            $this->topbar(),
                            Breadcrumbs::make(),
                            Outlet::make(),
                            RawBlock::make('chat-scroll-clearance')->html('<div class="h-24" aria-hidden="true"></div>'),
                        ]),
                ]),
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
                MenuItem::fromPage(HomePage::class)->key('home')->label(__('workbench.navigation.home'))->prefix(Affix::icon('house')),
                MenuItem::make(__('workbench.navigation.forms'), 'forms')->prefix(Affix::icon('form-input'))->children([
                    MenuItem::fromPage(ShowcasePage::class)->key('showcase')->label(__('workbench.navigation.showcase')),
                    MenuItem::fromPage(DependentDemoPage::class)->key('dependent-fields')->label(__('workbench.navigation.dependent-fields')),
                    MenuItem::fromPage(BuilderTableDemoPage::class)->key('builder-table-demo')->label(__('workbench.navigation.builder-table-demo')),
                    MenuItem::fromPage(ProductCreatePage::class)->key('create-product')->label(__('workbench.navigation.create-product')),
                ]),
                MenuItem::make(__('workbench.navigation.commerce'), 'commerce')->prefix(Icon::LayoutDashboard)->children([
                    MenuItem::fromPage(BusinessPartnersPage::class)->key('business-partners')->label(__('workbench.navigation.business-partners')),
                    MenuItem::fromPage(GroupsPage::class)->key('groups')->label(__('workbench.navigation.groups')),
                    MenuItem::fromPage(ProductsPage::class)->key('products')->label(__('workbench.navigation.products')),
                    MenuItem::fromPage(SalesOrdersPage::class)->key('sales-orders')->label(__('workbench.navigation.sales-orders')),
                ]),
                MenuItem::make(__('workbench.navigation.tables'), 'tables')->prefix(Icon::Table)->children([
                    MenuItem::fromPage(TablesPage::class)->key('pagination-modes')->label(__('workbench.navigation.pagination-modes')),
                ]),
                MenuItem::fromPage(RemoteSchemaPage::class)->key('remote-schema')->label(__('workbench.navigation.remote-schema'))->prefix(Affix::icon('plug')),
                MenuItem::fromPage(TabsPage::class)->key('tabs')->label(__('workbench.navigation.tabs'))->prefix(Affix::icon('spark')),
            ]),
        ]);
    }

    protected function topbar(): Topbar
    {
        return Topbar::make('app-topbar')->sticky()->items([
            Stack::make('topbar-end')
                ->direction('row')
                ->align(Align::Center)
                ->gap(Gap::Small)
                ->width(Width::Auto)
                ->float(Side::End)
                ->schema([
                    $this->localeSwitcher(),
                    Menu::make('topbar-settings')->items([
                        MenuItem::make(__('workbench.navigation.settings'), 'settings')
                            ->icon(Icon::Settings)
                            ->href('/settings'),
                    ]),
                    $this->userMenu(),
                ]),
        ]);
    }

    protected function userMenu(): Dropdown
    {
        return Dropdown::make('user-menu')
            ->placement(Placement::Bottom)
            ->trigger([
                Stack::make('user-menu-trigger')
                    ->direction('row')
                    ->align(Align::Center)
                    ->gap(Gap::Small)
                    ->width(Width::Auto)
                    ->schema([
                        RawBlock::make('user-menu-avatar')->html('<span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-lt-muted text-xs font-medium text-lt-fg">WU</span>'),
                        RawBlock::make('user-menu-identity')
                            ->html('<span class="grid min-w-0 text-left"><span class="truncate text-sm font-medium text-lt-fg">Workbench User</span><span class="truncate text-xs text-lt-muted-fg">dev@example.com</span></span>'),
                    ]),
            ])
            ->items([
                MenuItem::make(__('workbench.navigation.log-out'), 'log-out')->href('/logout')->method(HttpMethod::Post),
            ]);
    }

    protected function localeSwitcher(): Dropdown
    {
        $locale = app()->getLocale();
        $current = $locale === 'de' ? __('workbench.language.de') : __('workbench.language.en');

        return Dropdown::make('locale-switcher')
            ->placement(Placement::Bottom)
            ->trigger([
                RawBlock::make('locale-trigger')->html(
                    '<span class="inline-flex items-center gap-1 rounded-lt-sm px-2 py-1.5 text-sm font-medium text-lt-fg hover:bg-lt-muted">'.e($current).'</span>',
                ),
            ])
            ->items([
                ActionComponent::use(SetLocaleAction::class)
                    ->key('locale-en')
                    ->label(__('workbench.language.en'))
                    ->variant(ButtonVariant::Ghost)
                    ->context(['locale' => 'en']),
                ActionComponent::use(SetLocaleAction::class)
                    ->key('locale-de')
                    ->label(__('workbench.language.de'))
                    ->variant(ButtonVariant::Ghost)
                    ->context(['locale' => 'de']),
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
