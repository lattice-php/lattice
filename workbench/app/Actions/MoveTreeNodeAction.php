<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Tree\Support\AdjacencyListMovePlanner;
use Lattice\Tree\Support\NodePlacement;
use Workbench\App\Models\Category;

#[AsAction('workbench.tree.move-node')]
final class MoveTreeNodeAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Move node');
    }

    public function handle(Request $request): ActionResult
    {
        $payload = $request->validate([
            'nodeId' => ['required', 'string'],
            'parentId' => ['nullable', 'string'],
            'position' => ['required', 'integer', 'min:0'],
        ]);

        $categories = Category::query()->get();

        if (! $categories->contains(fn (Category $category): bool => (string) $category->getKey() === $payload['nodeId'])) {
            return ActionResult::success($payload);
        }

        $plan = AdjacencyListMovePlanner::plan(
            $categories->map(fn (Category $category): NodePlacement => new NodePlacement($category->id, $category->parent_id, $category->sort_order)),
            $payload['nodeId'],
            $payload['parentId'] ?? null,
            $payload['position'],
        );

        if ($plan === null) {
            return ActionResult::failure('The node cannot be moved there.');
        }

        DB::transaction(function () use ($plan): void {
            foreach ($plan as $placement) {
                Category::query()->whereKey($placement->id)->update([
                    'parent_id' => $placement->parentId,
                    'sort_order' => $placement->position,
                ]);
            }
        });

        return ActionResult::success($payload);
    }
}
