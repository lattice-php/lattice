<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Ui\Enums\ModalWidth;
use Lattice\Lattice\Ui\Enums\Variant;

#[AsAction('workbench.modals.submit-feedback')]
class SubmitFeedbackAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label(__('workbench.pages.components.modals.feedback.label'))
            ->slideOut()
            ->modalWidth(ModalWidth::Xl)
            ->form([
                Textarea::make('message', __('workbench.pages.components.modals.feedback.message'))
                    ->required()
                    ->rules(['string', 'max:500']),
            ]);
    }

    public function handle(Request $request): ActionResult
    {
        $this->validate($request);

        return ActionResult::success()
            ->toast(__('workbench.pages.components.modals.feedback.toast'), Variant::Success);
    }
}
