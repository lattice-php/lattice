<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Board\BoardRegistry;
use Lattice\Core\Attributes\AsAction;
use Workbench\App\Models\Task;

#[AsAction('workbench.board.open-task')]
final class OpenTaskAction extends ActionDefinition
{
    public function __construct(private readonly BoardRegistry $boards) {}

    public function definition(Action $action): Action
    {
        return $action->label('Open task');
    }

    public function handle(Request $request): ActionResult
    {
        $payload = $request->validate([
            'cardId' => ['required', 'string'],
        ]);

        $this->boards->resolve($this->contextString('board'));

        $task = Task::query()->where('id', $payload['cardId'])->first();

        if (! $task) {
            return ActionResult::failure('Task not found.');
        }

        return ActionResult::success(['cardId' => $payload['cardId']])->toast('Opened "'.$task->title.'".');
    }
}
