<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Board\Components\Board;
use Lattice\Core\Attributes\AsPage;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Actions\MoveTaskAction;
use Workbench\App\Boards\TaskBoard;

#[AsPage(route: '/board')]
final class BoardPage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Board';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('board-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Text::make('A kanban board rendered by the lattice-php/board component package.'),
                    Board::use(TaskBoard::class)->moveAction(MoveTaskAction::class),
                ]),
        ]);
    }
}
