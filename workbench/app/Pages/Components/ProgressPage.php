<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Color;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Progress;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Size;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/progress')]
final class ProgressPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.components.progress.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('progress-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make(__('workbench.pages.components.progress.bars')),
                    Stack::make('progress-bars')
                        ->gap(Gap::Small)
                        ->schema([
                            Progress::bar(25, 'progress-bar-primary'),
                            Progress::bar(50, 'progress-bar-success')->color(Color::success())->showValue(),
                            Progress::bar(80, 'progress-bar-large')->color(Color::warning())->size(Size::Lg)->showValue(),
                        ]),
                    Heading::make(__('workbench.pages.components.progress.circles'), 2),
                    Stack::make('progress-circles')
                        ->direction(Orientation::Horizontal)
                        ->gap(Gap::Medium)
                        ->schema([
                            Progress::circle(25, 'progress-circle-primary')->showValue(),
                            Progress::circle(35, 'progress-circle-scaled')->max(50)->color(Color::success())->size(Size::Xl)->showValue(),
                            Progress::circle(90, 'progress-circle-danger')->color(Color::danger())->size(Size::Lg),
                        ]),
                ]),
        ]);
    }
}
