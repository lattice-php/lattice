<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Board\BoardColumn;
use Lattice\Board\BoardRegistry;
use Lattice\Core\Attributes\AsAction;
use Workbench\App\Models\Task;

#[AsAction('workbench.board.create-task')]
final class CreateTaskAction extends ActionDefinition
{
    public function __construct(private readonly BoardRegistry $boards) {}

    public function definition(Action $action): Action
    {
        return $action->label('Add task');
    }

    public function handle(Request $request): ActionResult
    {
        $payload = $request->validate([
            'column' => ['required', 'string'],
            'title' => ['required', 'string', 'max:255'],
        ]);

        $board = $this->boards->resolve($this->contextString('board'));

        $columnKeys = array_map(
            fn (BoardColumn $column): string => $column->key(),
            $board->columns(),
        );

        if (! in_array($payload['column'], $columnKeys, true)) {
            return ActionResult::failure('Unknown column.');
        }

        $position = (int) (Task::query()->where('status', $payload['column'])->max('position') ?? -1) + 1;

        $task = Task::query()->create([
            'title' => $payload['title'],
            'status' => $payload['column'],
            'position' => $position,
        ]);

        return ActionResult::success(['cardId' => (string) $task->id])->toast('Task added.');
    }
}
