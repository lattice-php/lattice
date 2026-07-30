<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Workbench;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;

#[AsAction('workbench.context-reader')]
class WorkbenchContextAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Context reader');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'project' => $this->contextString('project'),
            'role' => $this->contextInt('role'),
            'nested' => $this->contextStringOrNull('team.slug'),
            'missingString' => $this->contextStringOrNull('missing'),
            'missingInt' => $this->contextIntOrNull('missing'),
        ]);
    }
}
