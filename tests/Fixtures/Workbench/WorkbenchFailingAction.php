<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Workbench;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;

#[AsAction('workbench.failing')]
final class WorkbenchFailingAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Fail');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::failure('Could not process.');
    }
}
