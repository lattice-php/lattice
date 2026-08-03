<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Tree\Tree;
use Workbench\App\Trees\CategoryTree;

#[AsPage(route: '/tree-lazy-skeleton')]
final class SkeletonLazyTreePage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Lazy tree skeleton';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('lazy-skeleton-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make($this->title()),
                    Tree::use(CategoryTree::class)->lazy(0),
                ]),
        ]);
    }
}
