<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tests\Fixtures\Discovery;

use Bambamboole\Lattice\Attributes\Table;
use Bambamboole\Lattice\Tables\Columns\TextColumn;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableQuery;
use Bambamboole\Lattice\Tables\TableResult;

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
