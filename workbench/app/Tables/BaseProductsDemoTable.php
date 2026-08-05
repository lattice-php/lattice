<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableQuery;
use Workbench\App\Models\Product;

/**
 * @extends EloquentTableDefinition<Product>
 */
abstract class BaseProductsDemoTable extends EloquentTableDefinition
{
    /**
     * @return Builder<Product>
     */
    abstract protected function query(): Builder;

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = $this->query();

        if ($query->sorts === []) {
            $builder->latest('id');
        }

        return $builder;
    }
}
