<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\Badge;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Card;
use Lattice\Ui\Components\Collapsible;
use Lattice\Ui\Components\Grid;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Section;
use Lattice\Ui\Components\Separator;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Components\Tooltip;
use Lattice\Ui\Enums\Emphasis;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/containers')]
final class ContainersPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.components.containers.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('containers-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Card::make(__('workbench.pages.components.containers.card-title'), __('workbench.pages.components.containers.card-description'))
                        ->tooltip(__('workbench.pages.components.containers.card-tooltip'))
                        ->schema([
                            Text::make(__('workbench.pages.components.containers.card-body')),
                            Badge::make(__('workbench.pages.components.containers.card-badge')),
                        ]),
                    Grid::make('containers-grid')->columns(['default' => 1, 'md' => 3])->schema([
                        Badge::make(__('workbench.pages.components.containers.grid-first'))->columnSpan(2),
                        Badge::make(__('workbench.pages.components.containers.grid-second')),
                        Badge::make(__('workbench.pages.components.containers.grid-third'))->columnSpanFull(),
                    ]),
                    Section::make(__('workbench.pages.components.containers.section-title'), __('workbench.pages.components.containers.section-description'))
                        ->collapsible()
                        ->headerActions([Button::make(__('workbench.pages.components.containers.section-action'))->emphasis(Emphasis::Outline)])
                        ->schema([
                            Text::make(__('workbench.pages.components.containers.section-body')),
                        ]),
                    Collapsible::make('containers-collapsible')
                        ->trigger([Text::make(__('workbench.pages.components.containers.collapsible-trigger'))])
                        ->content([Text::make(__('workbench.pages.components.containers.collapsible-body'))]),
                    Stack::make('containers-tooltip')
                        ->direction(Orientation::Horizontal)
                        ->gap(Gap::Small)
                        ->schema([
                            Badge::make(__('workbench.pages.components.containers.tooltip-badge')),
                            Tooltip::make()->content(__('workbench.pages.components.containers.tooltip-content')),
                        ]),
                    Separator::make(),
                    Text::make(__('workbench.pages.components.containers.separator-note')),
                ]),
        ]);
    }
}
