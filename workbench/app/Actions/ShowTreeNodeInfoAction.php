<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;

#[AsAction('workbench.tree.show-node-info')]
final class ShowTreeNodeInfoAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Show info')->icon('info');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success()->openModal('tree-node-info');
    }
}
