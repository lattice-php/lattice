<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Board\BoardRegistry;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Concerns\ResolvesContextModels;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;
use Workbench\App\Models\Task;

#[AsAction('workbench.board.delete-task')]
final class DeleteTaskAction extends ActionDefinition
{
    use ResolvesContextModels;

    public function __construct(private readonly BoardRegistry $boards) {}

    public function definition(Action $action): Action
    {
        return $action
            ->label('Delete')
            ->variant(Variant::Danger)
            ->method(HttpMethod::Delete)
            ->confirm('Delete task', 'This cannot be undone.');
    }

    public function handle(Request $request): ActionResult
    {
        $this->boards->resolve($this->contextString('board'));

        $this->task()->delete();

        return ActionResult::success()->toast('Task deleted.');
    }

    private function task(): Task
    {
        return $this->contextModel('card_id', Task::class);
    }
}
