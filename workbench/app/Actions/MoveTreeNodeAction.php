<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;

#[AsAction('workbench.tree.move-node')]
final class MoveTreeNodeAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Move node');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success($request->validate([
            'nodeId' => ['required', 'string'],
            'parentId' => ['nullable', 'string'],
            'position' => ['required', 'integer', 'min:0'],
        ]));
    }
}
