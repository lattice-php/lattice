<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\ModalHeight;
use Lattice\Ui\Enums\ModalWidth;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Side;
use Lattice\Ui\PageSchema;
use Workbench\App\Actions\SubmitFeedbackAction;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/modals')]
final class ModalsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.components.modals.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('modals-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.pages.components.modals.intro')),
                    Stack::make('modal-triggers')
                        ->direction(Orientation::Horizontal)
                        ->gap(Gap::Small)
                        ->schema([
                            Button::make(__('workbench.pages.components.modals.dialog.trigger'), 'open-centered')
                                ->modal(
                                    Modal::make('demo-dialog')
                                        ->title(__('workbench.pages.components.modals.dialog.title'))
                                        ->description(__('workbench.pages.components.modals.dialog.description'))
                                        ->width(ModalWidth::Md)
                                        ->schema([
                                            Text::make(__('workbench.pages.components.modals.dialog.body')),
                                        ]),
                                ),
                            Button::make(__('workbench.pages.components.modals.sheet-end.trigger'), 'open-end-sheet')
                                ->modal(
                                    Modal::make('demo-sheet-end')
                                        ->title(__('workbench.pages.components.modals.sheet-end.title'))
                                        ->description(__('workbench.pages.components.modals.sheet-end.description'))
                                        ->slideOut()
                                        ->width(ModalWidth::Xl)
                                        ->schema([
                                            Text::make(__('workbench.pages.components.modals.sheet-end.body')),
                                        ]),
                                ),
                            Button::make(__('workbench.pages.components.modals.sheet-start.trigger'), 'open-start-sheet')
                                ->modal(
                                    Modal::make('demo-sheet-start')
                                        ->title(__('workbench.pages.components.modals.sheet-start.title'))
                                        ->slideOut(Side::Start)
                                        ->schema([
                                            Text::make(__('workbench.pages.components.modals.sheet-start.body')),
                                        ]),
                                ),
                            Button::make(__('workbench.pages.components.modals.max.trigger'), 'open-max')
                                ->modal(
                                    Modal::make('demo-max')
                                        ->title(__('workbench.pages.components.modals.max.title'))
                                        ->description(__('workbench.pages.components.modals.max.description'))
                                        ->width(ModalWidth::Max)
                                        ->height(ModalHeight::Max)
                                        ->schema([
                                            Text::make(__('workbench.pages.components.modals.max.body')),
                                        ]),
                                ),
                            Action::use(SubmitFeedbackAction::class),
                        ]),
                ]),
        ]);
    }
}
