<?php
declare(strict_types=1);

namespace Lattice\Media\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Media\Models\MediaFolder;
use Lattice\Tree\Support\AdjacencyListMovePlanner;
use Lattice\Tree\Support\NodePlacement;
use Lattice\Ui\Enums\HttpMethod;

/** The folder tree's drag-and-drop target: re-parents and reorders one folder. */
#[AsAction('media.folder.move')]
final class MoveMediaFolderAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action
            ->label(__('media::media.folders.move.label'))
            ->method(HttpMethod::Post);
    }

    #[\Override]
    public function authorize(Request $request): bool
    {
        return Gate::allows('create', MediaFolder::class);
    }

    public function handle(Request $request): ActionResult
    {
        $payload = $request->validate([
            'nodeId' => ['required', 'integer'],
            'parentId' => ['nullable', 'integer'],
            'position' => ['required', 'integer', 'min:0'],
        ]);

        $folders = MediaFolder::query()->get();

        $plan = AdjacencyListMovePlanner::plan(
            $folders->map(fn (MediaFolder $folder): NodePlacement => new NodePlacement(
                (int) $folder->getKey(),
                $folder->parent_id,
                $folder->sort_order,
            )),
            (int) $payload['nodeId'],
            $payload['parentId'] ?? null,
            (int) $payload['position'],
        );

        if ($plan === null) {
            return ActionResult::failure(__('media::media.folders.move.rejected'));
        }

        DB::transaction(function () use ($plan): void {
            foreach ($plan as $placement) {
                MediaFolder::query()->whereKey($placement->id)->update([
                    'parent_id' => $placement->parentId,
                    'sort_order' => $placement->position,
                ]);
            }
        });

        return ActionResult::success($payload);
    }
}
