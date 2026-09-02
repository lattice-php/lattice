<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Tables\PagesTable;

#[AsPage(route: '/pages')]
final class PagesPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.blocks.pages.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('pages-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.blocks.pages.description')),
                    Table::use(PagesTable::class),
                ]),
        ]);
    }
}
