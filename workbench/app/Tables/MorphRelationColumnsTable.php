<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\BusinessPartner;

/**
 * @extends EloquentTableDefinition<BusinessPartner>
 */
#[AsTable('workbench.morph-relation-columns')]
class MorphRelationColumnsTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name'),
            TextColumn::make('internalNote.body')->label('Internal note')->searchable()->sortable()->filterable(),
            TextColumn::make('notes')->multiple('body')->label('Notes'),
        ];
    }

    /**
     * @return Builder<BusinessPartner>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = BusinessPartner::query();

        if ($query->sorts === []) {
            $builder->orderBy('name');
        }

        return $builder;
    }
}
