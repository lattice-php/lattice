<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Modal;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\ModalWidth;
use Lattice\Lattice\Ui\Enums\Side;
use Lattice\Lattice\Ui\Enums\StackDirection;
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
                        ->direction(StackDirection::Row)
                        ->gap(Gap::Small)
                        ->schema([
                            Button::make(__('workbench.pages.components.modals.dialog.trigger'), 'open-centered')
                                ->effects(Effects::openModal('demo-dialog')),
                            Button::make(__('workbench.pages.components.modals.sheet-end.trigger'), 'open-end-sheet')
                                ->effects(Effects::openModal('demo-sheet-end')),
                            Button::make(__('workbench.pages.components.modals.sheet-start.trigger'), 'open-start-sheet')
                                ->effects(Effects::openModal('demo-sheet-start')),
                            Action::use(SubmitFeedbackAction::class),
                        ]),
                    Modal::make('demo-dialog')
                        ->title(__('workbench.pages.components.modals.dialog.title'))
                        ->description(__('workbench.pages.components.modals.dialog.description'))
                        ->width(ModalWidth::Md)
                        ->schema([
                            Text::make(__('workbench.pages.components.modals.dialog.body')),
                        ]),
                    Modal::make('demo-sheet-end')
                        ->title(__('workbench.pages.components.modals.sheet-end.title'))
                        ->description(__('workbench.pages.components.modals.sheet-end.description'))
                        ->slideOut()
                        ->width(ModalWidth::Xl)
                        ->schema([
                            Text::make(__('workbench.pages.components.modals.sheet-end.body')),
                        ]),
                    Modal::make('demo-sheet-start')
                        ->title(__('workbench.pages.components.modals.sheet-start.title'))
                        ->slideOut(Side::Start)
                        ->schema([
                            Text::make(__('workbench.pages.components.modals.sheet-start.body')),
                        ]),
                ]),
        ]);
    }
}
