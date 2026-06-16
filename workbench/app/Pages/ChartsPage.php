<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\Components\Fragment;
use Workbench\App\Fragments\OrderVolumeChartFragment;
use Workbench\App\Fragments\RevenueTrendChartFragment;
use Workbench\App\Fragments\SalesMixChartFragment;

#[Page(route: '/charts')]
final class ChartsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.charts.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('charts-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Stack::make('charts-heading')
                        ->gap(Gap::Small)
                        ->schema([
                            Heading::make(__('workbench.pages.charts.heading')),
                            Text::make(__('workbench.pages.charts.description')),
                        ]),
                    Grid::make('charts-grid')
                        ->columns(2)
                        ->schema([
                            Fragment::lazy(RevenueTrendChartFragment::class),
                            Fragment::lazy(SalesMixChartFragment::class),
                            Fragment::lazy(OrderVolumeChartFragment::class),
                        ]),
                ]),
        ]);
    }
}
