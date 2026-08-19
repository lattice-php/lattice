<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Form\Components\Textarea;
use Lattice\Ui\Enums\ModalWidth;
use Lattice\Ui\Enums\Variant;

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

    public function handle(): ActionResult
    {
        return ActionResult::success()
            ->toast(__('workbench.pages.components.modals.feedback.toast'), Variant::Success);
    }
}
