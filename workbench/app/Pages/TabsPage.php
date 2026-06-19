<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Orientation;
use Lattice\Lattice\Core\Enums\TabsAlignment;
use Lattice\Lattice\Core\PageSchema;

#[AsPage(route: '/tabs')]
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
                        ->alignment(TabsAlignment::Center)
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
                        ->alignment(TabsAlignment::End)
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
