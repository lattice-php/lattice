<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Workbench;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;

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
