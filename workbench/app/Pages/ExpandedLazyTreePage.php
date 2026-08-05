<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Tree\Tree;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Models\Category;
use Workbench\App\Trees\CategoryTree;

#[AsPage(route: '/tree-lazy-expanded')]
final class ExpandedLazyTreePage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Lazy tree, pre-expanded';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('lazy-expanded-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Tree::use(CategoryTree::class)
                        ->lazy()
                        ->defaultExpanded([(string) Category::query()->where('name', 'Electronics')->value('id')])
                        ->rememberState(),
                ]),
        ]);
    }
}
