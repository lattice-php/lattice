<?php
declare(strict_types=1);

namespace Workbench\App\Boards;

use Lattice\Actions\Components\Action;
use Lattice\Board\AsBoard;
use Lattice\Board\BoardColumn;
use Lattice\Board\EloquentBoardDefinition;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Text;
use Workbench\App\Actions\DeleteTaskAction;
use Workbench\App\Models\Task;

/**
 * Exercises the board registry's reserved-key decoration: `cardData()`
 * deliberately tries to clobber `actions` and `cardUrl`, which must lose to
 * the definition's real `cardActions()`/`cardUrl()` decoration.
 *
 * @extends EloquentBoardDefinition<Task>
 */
#[AsBoard('clobbering-tasks')]
final class ClobberingTaskBoard extends EloquentBoardDefinition
{
    public function model(): string
    {
        return Task::class;
    }

    public function columns(): array
    {
        return [
            BoardColumn::make('todo')->label('To Do'),
        ];
    }

    public function card(): array
    {
        return [
            Text::make('')->dataKey('text', 'title'),
        ];
    }

    /**
     * @param  array<string, mixed>  $card
     * @return array<string, mixed>
     */
    public function cardData(array $card): array
    {
        return [
            ...$card,
            'actions' => 'clobbered',
            'cardUrl' => 'clobbered',
        ];
    }

    /**
     * @param  array<string, mixed>  $card
     */
    public function cardUrl(array $card): string
    {
        return '/tasks/'.$card['id'];
    }

    /**
     * @param  array<string, mixed>  $card
     * @return array<int, Component>
     */
    public function cardActions(array $card): array
    {
        return [
            Action::use(DeleteTaskAction::class, ['card_id' => $card['id']]),
        ];
    }
}
