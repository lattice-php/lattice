<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Tab;
use Lattice\Ui\Components\Tabs;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Align;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/tabs')]
final class TabsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.tabs.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('tabs-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make(__('workbench.pages.tabs.horizontal')),
                    Tabs::make('horizontal-tabs')
                        ->queryKey('h')
                        ->defaultValue('overview')
                        ->schema([
                            Tab::make('overview', __('workbench.pages.tabs.overview'))->schema([Text::make(__('workbench.pages.tabs.overview-panel'))]),
                            Tab::make('details', __('workbench.pages.tabs.details'))->schema([Text::make(__('workbench.pages.tabs.details-panel'))]),
                            Tab::make('history', __('workbench.pages.tabs.history'))->schema([Text::make(__('workbench.pages.tabs.history-panel'))]),
                        ]),
                    Heading::make(__('workbench.pages.tabs.horizontal-centered')),
                    Tabs::make('centered-tabs')
                        ->queryKey('c')
                        ->alignment(Align::Center)
                        ->defaultValue('overview')
                        ->schema([
                            Tab::make('overview', __('workbench.pages.tabs.overview'))->schema([Text::make(__('workbench.pages.tabs.overview-panel'))]),
                            Tab::make('details', __('workbench.pages.tabs.details'))->schema([Text::make(__('workbench.pages.tabs.details-panel'))]),
                            Tab::make('history', __('workbench.pages.tabs.history'))->schema([Text::make(__('workbench.pages.tabs.history-panel'))]),
                        ]),
                    Heading::make(__('workbench.pages.tabs.vertical')),
                    Tabs::make('vertical-tabs')
                        ->queryKey('v')
                        ->orientation(Orientation::Vertical)
                        ->defaultValue('account')
                        ->schema([
                            Tab::make('account', __('workbench.pages.tabs.account'))->schema([Text::make(__('workbench.pages.tabs.account-panel'))]),
                            Tab::make('security', __('workbench.pages.tabs.security'))->schema([Text::make(__('workbench.pages.tabs.security-panel'))]),
                            Tab::make('billing', __('workbench.pages.tabs.billing'))->schema([Text::make(__('workbench.pages.tabs.billing-panel'))]),
                        ]),
                    Heading::make(__('workbench.pages.tabs.vertical-end')),
                    Tabs::make('vertical-end-tabs')
                        ->queryKey('ve')
                        ->orientation(Orientation::Vertical)
                        ->alignment(Align::End)
                        ->defaultValue('account')
                        ->schema([
                            Tab::make('account', __('workbench.pages.tabs.account'))->schema([Text::make(__('workbench.pages.tabs.account-panel'))]),
                            Tab::make('security', __('workbench.pages.tabs.security'))->schema([Text::make(__('workbench.pages.tabs.security-panel'))]),
                            Tab::make('billing', __('workbench.pages.tabs.billing'))->schema([Text::make(__('workbench.pages.tabs.billing-panel'))]),
                        ]),
                ]),
        ]);
    }
}
