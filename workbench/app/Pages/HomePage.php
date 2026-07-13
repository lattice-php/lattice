<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\Components\Fragment;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Ui\Components\Badge;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Card;
use Lattice\Lattice\Ui\Components\Grid;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\ButtonVariant;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\Size;
use Lattice\Lattice\Ui\Enums\StackDirection;
use Workbench\App\Fragments\OrderVolumeChartFragment;
use Workbench\App\Fragments\RevenueTrendChartFragment;
use Workbench\App\Fragments\SalesMixChartFragment;
use Workbench\App\Tables\UsersTable;

#[AsPage(route: '/')]
final class HomePage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.home.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('workbench-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Stack::make('workbench-hero')
                        ->gap(Gap::Large)
                        ->schema([
                            Badge::make(__('workbench.pages.home.badge')),
                            Heading::make(__('workbench.pages.home.heading')),
                            Text::make(__('workbench.pages.home.intro')),
                        ]),
                    Grid::make('workbench-capabilities')
                        ->columns(2)
                        ->schema([
                            Card::make(__('workbench.pages.home.components-title'), __('workbench.pages.home.components-description')),
                            Card::make(__('workbench.pages.home.renderer-title'), __('workbench.pages.home.renderer-description')),
                        ]),
                    Heading::make(__('workbench.pages.home.charts'), 2),
                    Grid::make('workbench-charts')
                        ->columns(3)
                        ->schema([
                            Fragment::lazy(RevenueTrendChartFragment::class)->size(Size::Lg),
                            Fragment::lazy(SalesMixChartFragment::class)->size(Size::Lg),
                            Fragment::lazy(OrderVolumeChartFragment::class)->size(Size::Lg),
                        ]),
                    Heading::make(__('workbench.pages.home.button-variants'), 2),
                    Stack::make('workbench-buttons')
                        ->direction(StackDirection::Row)
                        ->gap(Gap::Small)
                        ->schema([
                            Button::make(__('workbench.pages.home.buttons.default'), 'button-default')->variant(ButtonVariant::Default),
                            Button::make(__('workbench.pages.home.buttons.secondary'), 'button-secondary')->variant(ButtonVariant::Secondary),
                            Button::make(__('workbench.pages.home.buttons.success'), 'button-success')->variant(ButtonVariant::Success),
                            Button::make(__('workbench.pages.home.buttons.info'), 'button-info')->variant(ButtonVariant::Info),
                            Button::make(__('workbench.pages.home.buttons.destructive'), 'button-destructive')->variant(ButtonVariant::Destructive),
                            Button::make(__('workbench.pages.home.buttons.outline'), 'button-outline')->variant(ButtonVariant::Outline),
                            Button::make(__('workbench.pages.home.buttons.ghost'), 'button-ghost')->variant(ButtonVariant::Ghost),
                        ]),
                    Heading::make(__('workbench.pages.home.users'), 2),
                    Table::use(UsersTable::class),
                ]),
        ]);
    }
}
