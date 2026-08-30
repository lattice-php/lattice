<?php
declare(strict_types=1);

namespace Workbench\App\Boards;

use Lattice\Actions\Components\Action;
use Lattice\Board\AsBoard;
use Lattice\Board\BoardColumn;
use Lattice\Board\EloquentBoardDefinition;
use Lattice\EloquentOptions;
use Lattice\Table\Filters\Filter;
use Lattice\Table\Filters\SelectFilter;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Workbench\App\Actions\DeleteTaskAction;
use Workbench\App\Models\Task;

/**
 * @extends EloquentBoardDefinition<Task>
 */
#[AsBoard('tasks')]
final class TaskBoard extends EloquentBoardDefinition
{
    public function model(): string
    {
        return Task::class;
    }

    public function columns(): array
    {
        return [
            BoardColumn::make('todo')->label('To Do')->color('gray'),
            BoardColumn::make('doing')->label('In Progress')->color('blue'),
            BoardColumn::make('done')->label('Done')->color('green'),
        ];
    }

    public function card(): array
    {
        return [
            Stack::make()
                ->gap(Gap::ExtraSmall)
                ->schema([
                    Text::make('')->dataKey('text', 'title'),
                    Text::make('')->dataKey('text', 'assignee'),
                ]),
        ];
    }

    public function searchable(): array
    {
        return ['title', 'assignee'];
    }

    /**
     * @return list<Filter>
     */
    public function filters(): array
    {
        return [
            SelectFilter::make('assignee')
                ->label('Assignee')
                ->optionsFrom(EloquentOptions::make(Task::class)->label('assignee')->value('assignee'))
                ->searchable(),
        ];
    }

    public function cardData(array $card): array
    {
        return [
            ...$card,
            'assigneeInitial' => $card['assignee'] === null ? null : mb_substr((string) $card['assignee'], 0, 1),
        ];
    }

    /**
     * @param  array<string, mixed>  $card
     * @return array<int, Component>
     */
    public function cardActions(array $card): array
    {
        return [
            Action::use(DeleteTaskAction::class, ['card_id' => $card['id']])->removesRecord(),
        ];
    }
}
