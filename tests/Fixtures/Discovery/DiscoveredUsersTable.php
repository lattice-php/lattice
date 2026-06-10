<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;

#[Table('fixtures.users')]
class DiscoveredUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name'),
        ];
    }

    public function query(TableQuery $query): TableResult
    {
        return TableResult::make([
            [
                'id' => 1,
                'name' => $this->context(request(), 'team'),
            ],
        ]);
    }
}
