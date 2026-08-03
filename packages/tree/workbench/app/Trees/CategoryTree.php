<?php
declare(strict_types=1);

namespace Workbench\App\Trees;

use Lattice\Tree\AsTree;
use Lattice\Tree\EloquentTreeSource;
use Lattice\Tree\TreeDefinition;
use Lattice\Tree\TreeSource;
use Workbench\App\Models\Category;

#[AsTree('categories')]
final class CategoryTree extends TreeDefinition
{
    public function source(): TreeSource
    {
        return EloquentTreeSource::make(Category::class);
    }
}
