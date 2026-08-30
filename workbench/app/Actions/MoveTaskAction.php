<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Board\BoardColumn;
use Lattice\Board\BoardRegistry;
use Lattice\Board\Support\BoardMovePlanner;
use Lattice\Board\Support\CardPlacement;
use Lattice\Core\Attributes\AsAction;
use Workbench\App\Models\Task;

#[AsAction('workbench.board.move-task')]
final class MoveTaskAction extends ActionDefinition
{
    public function __construct(private readonly BoardRegistry $boards) {}

    public function definition(Action $action): Action
    {
        return $action->label('Move task');
    }

    public function handle(Request $request): ActionResult
    {
        $payload = $request->validate([
            'cardId' => ['required', 'string'],
            'columnKey' => ['required', 'string'],
            'position' => ['required', 'integer', 'min:0'],
        ]);

        $board = $this->boards->resolve($this->contextString('board'));

        $columnKeys = array_map(
            fn (BoardColumn $column): string => $column->key(),
            $board->columns(),
        );

        $card = Task::query()->where('id', $payload['cardId'])->first();

        if (! $card) {
            return ActionResult::failure('The task cannot be moved there.');
        }

        $tasks = Task::query()
            ->whereIn('status', array_unique([$card->status, $payload['columnKey']]))
            ->get();

        $plan = BoardMovePlanner::plan(
            $tasks->map(fn (Task $task): CardPlacement => new CardPlacement($task->id, $task->status, $task->position)),
            $columnKeys,
            $payload['cardId'],
            $payload['columnKey'],
            $payload['position'],
        );

        if ($plan === null) {
            return ActionResult::failure('The task cannot be moved there.');
        }

        DB::transaction(function () use ($plan): void {
            foreach ($plan as $placement) {
                Task::query()->whereKey($placement->id)->update([
                    'status' => $placement->columnKey,
                    'position' => $placement->position,
                ]);
            }
        });

        return ActionResult::success($payload);
    }
}
