<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Board\Components\Board;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Facades\Lattice;
use Workbench\App\Boards\TaskBoard;

use function Pest\Laravel\postJson;

beforeEach(function (): void {
    BoardCtxMoveAction::$seen = [];
});

it('seals the board key into the move action context, keeping explicit context', function (): void {
    Lattice::actions([BoardCtxMoveAction::class]);
    seedTaskBoard();

    $board = wire(Board::use(TaskBoard::class)->moveAction(BoardCtxMoveAction::class, ['reason' => 'drag']));
    $moveAction = wireNode($board, 'ctx-move.move-action');
    assert($moveAction !== null);

    postJson('/lattice/actions/ctx-move.move-action', [], ['X-Lattice-Ref' => $moveAction['props']['ref']])
        ->assertOk();

    expect(BoardCtxMoveAction::$seen['board'])->toBe('tasks')
        ->and(BoardCtxMoveAction::$seen['reason'])->toBe('drag');
});

#[AsAction('ctx-move.move-action')]
final class BoardCtxMoveAction extends ActionDefinition
{
    /** @var array<string, mixed> */
    public static array $seen = [];

    public function definition(Action $action): Action
    {
        return $action->label('Move task');
    }

    public function handle(Request $request): ActionResult
    {
        self::$seen['board'] = $this->context('board');
        self::$seen['reason'] = $this->context('reason');

        return ActionResult::success();
    }
}
