<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Workbench;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsAction;

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
