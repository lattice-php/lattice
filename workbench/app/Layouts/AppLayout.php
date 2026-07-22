<?php
declare(strict_types=1);

namespace Workbench\App\Layouts;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Chat\Components\ChatBox;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Layouts\Components\Breadcrumbs;
use Lattice\Lattice\Layouts\Components\Dropdown;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\Components\Sidebar;
use Lattice\Lattice\Layouts\Components\Topbar;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Lattice\Lattice\Notifications\Components\Notifications;
use Lattice\Lattice\Support\Affix;
use Lattice\Lattice\Ui\Components\Badge;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\FloatingPanel;
use Lattice\Lattice\Ui\Components\RawBlock;
use Lattice\Lattice\Ui\Components\SegmentedControl;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Align;
use Lattice\Lattice\Ui\Enums\ButtonVariant;
use Lattice\Lattice\Ui\Enums\FloatingPlacement;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\Icon;
use Lattice\Lattice\Ui\Enums\Placement;
use Lattice\Lattice\Ui\Enums\Side;
use Lattice\Lattice\Ui\Enums\StackDirection;
use Lattice\Lattice\Ui\Enums\Width;
use Workbench\App\Actions\LogoutAction;
use Workbench\App\Actions\SetLocaleAction;
use Workbench\App\Actions\ToggleChatLayoutAction;
use Workbench\App\Pages\BusinessPartnersPage;
use Workbench\App\Pages\Components\ButtonsPage;
use Workbench\App\Pages\Components\ChartsPage;
use Workbench\App\Pages\Components\ChatPage;
use Workbench\App\Pages\Components\ContainersPage;
use Workbench\App\Pages\Components\ModalsPage;
use Workbench\App\Pages\Components\NotificationsPage;
use Workbench\App\Pages\Components\ProgressPage;
use Workbench\App\Pages\Components\TabsPage;
use Workbench\App\Pages\DependentFieldsPage;
use Workbench\App\Pages\Fields\BooleanFieldsPage;
use Workbench\App\Pages\Fields\BuilderPage;
use Workbench\App\Pages\Fields\ChoicePage;
use Workbench\App\Pages\Fields\ColorPickerPage;
use Workbench\App\Pages\Fields\DateTimePage;
use Workbench\App\Pages\Fields\FileUploadPage;
use Workbench\App\Pages\Fields\NumberInputPage;
use Workbench\App\Pages\Fields\OtpInputPage;
use Workbench\App\Pages\Fields\PasswordInputPage;
use Workbench\App\Pages\Fields\RepeaterPage;
use Workbench\App\Pages\Fields\RichEditorPage;
use Workbench\App\Pages\Fields\SelectPage;
use Workbench\App\Pages\Fields\TextareaPage;
use Workbench\App\Pages\Fields\TextInputPage;
use Workbench\App\Pages\GroupsPage;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\Platform\PackageComponentPage;
use Workbench\App\Pages\Platform\RealtimePage;
use Workbench\App\Pages\Platform\RemoteSchemaPage;
use Workbench\App\Pages\ProductsPage;
use Workbench\App\Pages\SalesOrdersPage;
use Workbench\App\Pages\Tables\CustomColumnPage;
use Workbench\App\Pages\Tables\FiltersPage;
use Workbench\App\Pages\Tables\NumberColumnsPage;
use Workbench\App\Pages\Tables\PaginationPage;
use Workbench\App\Pages\Tables\TextColumnsPage;
use Workbench\App\Pages\Tables\VisualColumnsPage;
use Workbench\App\Pages\WizardPage;
use Workbench\App\Support\Logo;

#[AsLayout('app')]
class AppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')
                ->direction(StackDirection::Row)
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
                ->direction(StackDirection::Row)
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
                    MenuItem::make(__('workbench.navigation.fields'), 'fields')->children([
                        MenuItem::fromPage(TextInputPage::class)->key('field-text')->label(__('workbench.navigation.field-text')),
                        MenuItem::fromPage(TextareaPage::class)->key('field-textarea')->label(__('workbench.navigation.field-textarea')),
                        MenuItem::fromPage(NumberInputPage::class)->key('field-number')->label(__('workbench.navigation.field-number')),
                        MenuItem::fromPage(PasswordInputPage::class)->key('field-password')->label(__('workbench.navigation.field-password')),
                        MenuItem::fromPage(SelectPage::class)->key('field-select')->label(__('workbench.navigation.field-select')),
                        MenuItem::fromPage(ChoicePage::class)->key('field-choice')->label(__('workbench.navigation.field-choice')),
                        MenuItem::fromPage(ColorPickerPage::class)->key('field-color-picker')->label(__('workbench.navigation.field-color-picker')),
                        MenuItem::fromPage(BooleanFieldsPage::class)->key('field-boolean')->label(__('workbench.navigation.field-boolean')),
                        MenuItem::fromPage(DateTimePage::class)->key('field-date-time')->label(__('workbench.navigation.field-date-time')),
                        MenuItem::fromPage(FileUploadPage::class)->key('field-file-upload')->label(__('workbench.navigation.field-file-upload')),
                        MenuItem::fromPage(OtpInputPage::class)->key('field-otp')->label(__('workbench.navigation.field-otp')),
                        MenuItem::fromPage(RichEditorPage::class)->key('field-rich-editor')->label(__('workbench.navigation.field-rich-editor')),
                        MenuItem::fromPage(RepeaterPage::class)->key('field-repeater')->label(__('workbench.navigation.field-repeater')),
                        MenuItem::fromPage(BuilderPage::class)->key('field-builder')->label(__('workbench.navigation.field-builder')),
                    ]),
                    MenuItem::fromPage(DependentFieldsPage::class)->key('dependent-fields')->label(__('workbench.navigation.dependent-fields')),
                    MenuItem::fromPage(WizardPage::class)->key('wizard')->label(__('workbench.navigation.wizard')),
                ]),
                MenuItem::make(__('workbench.navigation.tables'), 'tables')->prefix(Icon::Table)->children([
                    MenuItem::make(__('workbench.navigation.columns'), 'columns')->children([
                        MenuItem::fromPage(TextColumnsPage::class)->key('columns-text')->label(__('workbench.navigation.columns-text')),
                        MenuItem::fromPage(NumberColumnsPage::class)->key('columns-number')->label(__('workbench.navigation.columns-number')),
                        MenuItem::fromPage(VisualColumnsPage::class)->key('columns-visual')->label(__('workbench.navigation.columns-visual')),
                        MenuItem::fromPage(CustomColumnPage::class)->key('columns-custom')->label(__('workbench.navigation.columns-custom')),
                    ]),
                    MenuItem::fromPage(FiltersPage::class)->key('table-filters')->label(__('workbench.navigation.table-filters')),
                    MenuItem::fromPage(PaginationPage::class)->key('pagination-modes')->label(__('workbench.navigation.pagination-modes')),
                ]),
                MenuItem::make(__('workbench.navigation.components'), 'components')->prefix(Affix::icon('spark'))->children([
                    MenuItem::fromPage(ButtonsPage::class)->key('buttons')->label(__('workbench.navigation.buttons')),
                    MenuItem::fromPage(TabsPage::class)->key('tabs')->label(__('workbench.navigation.tabs')),
                    MenuItem::fromPage(ChartsPage::class)->key('charts')->label(__('workbench.navigation.charts')),
                    MenuItem::fromPage(ProgressPage::class)->key('progress')->label(__('workbench.navigation.progress')),
                    MenuItem::fromPage(ContainersPage::class)->key('containers')->label(__('workbench.navigation.containers')),
                    MenuItem::fromPage(ModalsPage::class)->key('modals')->label(__('workbench.navigation.modals')),
                    MenuItem::fromPage(NotificationsPage::class)->key('notifications')->label(__('workbench.navigation.notifications')),
                    MenuItem::fromPage(ChatPage::class)->key('chat')->label(__('workbench.navigation.chat')),
                ]),
                MenuItem::make(__('workbench.navigation.platform'), 'platform')->prefix(Affix::icon('plug'))->children([
                    MenuItem::fromPage(RealtimePage::class)->key('realtime')->label(__('workbench.navigation.realtime')),
                    MenuItem::fromPage(RemoteSchemaPage::class)->key('remote-schema')->label(__('workbench.navigation.remote-schema')),
                    MenuItem::fromPage(PackageComponentPage::class)->key('package')->label(__('workbench.navigation.package')),
                ]),
                MenuItem::make(__('workbench.navigation.app'), 'app')->prefix(Icon::LayoutDashboard)->children([
                    MenuItem::fromPage(BusinessPartnersPage::class)->key('business-partners')->label(__('workbench.navigation.business-partners')),
                    MenuItem::fromPage(GroupsPage::class)->key('groups')->label(__('workbench.navigation.groups')),
                    MenuItem::fromPage(ProductsPage::class)->key('products')->label(__('workbench.navigation.products')),
                    MenuItem::fromPage(SalesOrdersPage::class)->key('sales-orders')->label(__('workbench.navigation.sales-orders')),
                ]),
            ]),
        ]);
    }

    protected function topbar(): Topbar
    {
        return Topbar::make('app-topbar')->sticky()->items([
            Button::make(__('workbench.navigation.toggle-sidebar'), 'sidebar-toggle')
                ->icon('panel-left')
                ->variant(ButtonVariant::Ghost)
                ->effects(Effects::toggleSidebar('app-sidebar')),
            Stack::make('topbar-end')
                ->direction(StackDirection::Row)
                ->align(Align::Center)
                ->gap(Gap::Small)
                ->width(Width::Auto)
                ->float(Side::End)
                ->schema([
                    $this->appearanceSwitcher(),
                    $this->localeSwitcher(),
                    $this->notifications(),
                    $this->userMenu(),
                ]),
        ]);
    }

    private function notifications(): Notifications
    {
        $notifications = Notifications::make();

        if (request()->is('components/notifications') && request()->query('mode') === 'slide-out') {
            $notifications->slideOut();
        }

        return $notifications;
    }

    protected function userMenu(): Dropdown
    {
        return Dropdown::make('user-menu')
            ->placement(Placement::Bottom)
            ->trigger([
                Stack::make('user-menu-trigger')
                    ->direction(StackDirection::Row)
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
                $this->chatLayoutToggle(),
                MenuItem::make(__('workbench.navigation.log-out'), 'log-out')->action(LogoutAction::class),
            ]);
    }

    protected function chatLayoutToggle(): ActionComponent
    {
        $inline = (bool) session('workbench.chat_inline', false);

        return ActionComponent::use(ToggleChatLayoutAction::class)
            ->key('chat-layout-toggle')
            ->variant(ButtonVariant::Ghost)
            ->label($inline ? __('workbench.chat-layout.hide') : __('workbench.chat-layout.reveal'));
    }

    protected function appearanceSwitcher(): SegmentedControl
    {
        return SegmentedControl::make('appearance', null, 'appearance-switcher')
            ->value('system')
            ->emits('lattice:appearance-change')
            ->options([
                SegmentedControl::option(__('workbench.appearance.light'), 'light'),
                SegmentedControl::option(__('workbench.appearance.dark'), 'dark'),
                SegmentedControl::option(__('workbench.appearance.system'), 'system'),
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
                ActionComponent::use(SetLocaleAction::class, ['locale' => 'en'])
                    ->key('locale-en')
                    ->label(__('workbench.language.en'))
                    ->variant(ButtonVariant::Ghost),
                ActionComponent::use(SetLocaleAction::class, ['locale' => 'de'])
                    ->key('locale-de')
                    ->label(__('workbench.language.de'))
                    ->variant(ButtonVariant::Ghost),
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
