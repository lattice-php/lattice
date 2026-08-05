<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;

#[AsAction('mark-notification-seen')]
class MarkNotificationSeenAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Mark as seen');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }
}
