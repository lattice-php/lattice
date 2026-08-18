<?php

declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Pdf\Components\PdfViewer;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Enums\ModalWidth;

#[AsAction('workbench.pdf.open-modal')]
class OpenPdfModalAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label(__('workbench.pages.pdf.modal.trigger'));
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success()->openModal(
            Modal::make('pdf-document-modal')
                ->title(__('workbench.pages.pdf.modal.title'))
                ->width(ModalWidth::Xl)
                ->schema([
                    PdfViewer::make('modal-sample')
                        ->url(fn (): string => url('/fixtures/sample.pdf'))
                        ->filename('sample.pdf')
                        ->sidebar(false)
                        ->height(560),
                ]),
        );
    }
}
