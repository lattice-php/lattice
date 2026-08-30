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
    BoardCtxCardAction::$seen = [];
    BoardCtxCreateAction::$seen = [];
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

it('seals the board key into the card action context, keeping explicit context', function (): void {
    Lattice::actions([BoardCtxCardAction::class]);
    seedTaskBoard();

    $board = wire(Board::use(TaskBoard::class)->cardAction(BoardCtxCardAction::class, ['reason' => 'open']));
    $cardAction = wireNode($board, 'ctx-card.card-action');
    assert($cardAction !== null);

    postJson('/lattice/actions/ctx-card.card-action', [], ['X-Lattice-Ref' => $cardAction['props']['ref']])
        ->assertOk();

    expect(BoardCtxCardAction::$seen['board'])->toBe('tasks')
        ->and(BoardCtxCardAction::$seen['reason'])->toBe('open');
});

it('seals the board key into the create action context, keeping explicit context', function (): void {
    Lattice::actions([BoardCtxCreateAction::class]);
    seedTaskBoard();

    $board = wire(Board::use(TaskBoard::class)->createAction(BoardCtxCreateAction::class, ['reason' => 'quick-add']));
    $createAction = wireNode($board, 'ctx-create.create-action');
    assert($createAction !== null);

    postJson('/lattice/actions/ctx-create.create-action', [], ['X-Lattice-Ref' => $createAction['props']['ref']])
        ->assertOk();

    expect(BoardCtxCreateAction::$seen['board'])->toBe('tasks')
        ->and(BoardCtxCreateAction::$seen['reason'])->toBe('quick-add');
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

#[AsAction('ctx-card.card-action')]
final class BoardCtxCardAction extends ActionDefinition
{
    /** @var array<string, mixed> */
    public static array $seen = [];

    public function definition(Action $action): Action
    {
        return $action->label('Open task');
    }

    public function handle(Request $request): ActionResult
    {
        self::$seen['board'] = $this->context('board');
        self::$seen['reason'] = $this->context('reason');

        return ActionResult::success();
    }
}

#[AsAction('ctx-create.create-action')]
final class BoardCtxCreateAction extends ActionDefinition
{
    /** @var array<string, mixed> */
    public static array $seen = [];

    public function definition(Action $action): Action
    {
        return $action->label('Add task');
    }

    public function handle(Request $request): ActionResult
    {
        self::$seen['board'] = $this->context('board');
        self::$seen['reason'] = $this->context('reason');

        return ActionResult::success();
    }
}
