<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Tables;

use Lattice\Table\Components\Table;
use Lattice\Table\TableDefinition;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

abstract class TableDemoPage extends WorkbenchPage
{
    /** @return class-string<TableDefinition> */
    abstract protected function table(): string;

    abstract protected function slug(): string;

    public function title(): string
    {
        return __('workbench.pages.tables.'.$this->slug().'.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make($this->slug().'-table-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.pages.tables.'.$this->slug().'.description')),
                    Table::use($this->table()),
                ]),
        ]);
    }
}
