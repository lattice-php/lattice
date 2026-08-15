<?php

declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;

#[AsAction('workbench.pdf.open-modal')]
class OpenPdfModalAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label(__('workbench.pages.pdf.modal.trigger'));
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success()->openModal('pdf-document-modal');
    }
}
