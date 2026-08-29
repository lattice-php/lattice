<?php
declare(strict_types=1);

namespace Workbench\App\Boards;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Board\AsBoard;
use Lattice\Board\BoardColumn;
use Lattice\Board\EloquentBoardDefinition;
use Lattice\Ui\Components\Text;
use Workbench\App\Models\Task;

/**
 * @extends EloquentBoardDefinition<Task>
 */
#[AsBoard('scoped-tasks')]
final class ScopedTaskBoard extends EloquentBoardDefinition
{
    public function model(): string
    {
        return Task::class;
    }

    public function columns(): array
    {
        return [
            BoardColumn::make('todo')->label('To Do'),
            BoardColumn::make('doing')->label('In Progress'),
            BoardColumn::make('done')->label('Done'),
        ];
    }

    public function query(Builder $query): Builder
    {
        return $query->where('assignee', (string) $this->context('assignee'));
    }

    public function card(): array
    {
        return [
            Text::make('')->dataKey('text', 'title'),
        ];
    }

    /**
     * @param  array<string, mixed>  $card
     */
    public function cardUrl(array $card): string
    {
        return '/tasks/'.$card['id'];
    }
}
