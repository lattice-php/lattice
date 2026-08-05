<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Tree\Tree;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
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
