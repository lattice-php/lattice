<?php
declare(strict_types=1);

namespace Workbench\App\Boards;

use Illuminate\Http\Request;
use Lattice\Board\AsBoard;
use Lattice\Board\BoardColumn;
use Lattice\Board\EloquentBoardDefinition;
use Lattice\Ui\Components\Text;
use Workbench\App\Models\Task;

/**
 * @extends EloquentBoardDefinition<Task>
 */
#[AsBoard('denied')]
final class DeniedBoard extends EloquentBoardDefinition
{
    #[\Override]
    public function authorize(Request $request): bool
    {
        return false;
    }

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
}
