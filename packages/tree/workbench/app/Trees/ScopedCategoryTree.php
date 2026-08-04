<?php
declare(strict_types=1);

namespace Workbench\App\Trees;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Tree\AsTree;
use Lattice\Tree\EloquentTreeSource;
use Lattice\Tree\TreeDefinition;
use Lattice\Tree\TreeSource;
use Workbench\App\Models\Category;

#[AsTree('scoped-categories')]
final class ScopedCategoryTree extends TreeDefinition
{
    public function source(): TreeSource
    {
        return EloquentTreeSource::make(Category::class)
            ->scope(fn (Builder $query) => $query->where('name', '!=', (string) $this->context('except')));
    }
}
