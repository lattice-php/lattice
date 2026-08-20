<?php
declare(strict_types=1);

use Lattice\Core\Facades\Lattice;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;

beforeEach(function (): void {
    Lattice::tables([TextColumnLinkClosureTable::class]);
});

it('resolves a closure link per row into the links wire key', function (): void {
    $rows = wire(Table::use(TextColumnLinkClosureTable::class))['props']['data'];

    $active = $rows[0];

    expect($active['id'])->toBe(1)
        ->and($active)->toHaveKey('links')
        ->and($active['links']['name'])->toBe('/customers/1');
});

it('resolves the column key to null when the closure returns null, distinct from having no resolver at all', function (): void {
    $rows = wire(Table::use(TextColumnLinkClosureTable::class))['props']['data'];

    $inactive = $rows[1];

    expect($inactive['id'])->toBe(2)
        ->and($inactive)->toHaveKey('links')
        ->and($inactive['links'])->toHaveKey('name')
        ->and($inactive['links']['name'])->toBeNull();
});

it('omits the links key entirely for a table with no closure-driven link column', function (): void {
    Lattice::tables([TextColumnLinkTemplateTable::class]);

    $rows = wire(Table::use(TextColumnLinkTemplateTable::class))['props']['data'];

    expect($rows[0])->not->toHaveKey('links');
});

it('still carries the static link marker on the column props for the closure form', function (): void {
    $data = wire(TextColumnLinkClosureTable::columnUnderTest());

    expect($data['props']['link'])->toBe(['href' => null, 'external' => false]);
});

#[AsTable('text-column-link-closure.table')]
final class TextColumnLinkClosureTable extends TableDefinition
{
    public static function columnUnderTest(): TextColumn
    {
        return TextColumn::make('name')->link(fn (array $row): ?string => $row['active']
            ? '/customers/'.$row['id']
            : null);
    }

    public function columns(): array
    {
        return [self::columnUnderTest()];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            ['id' => 1, 'name' => 'Ada Lovelace', 'active' => true],
            ['id' => 2, 'name' => 'Grace Hopper', 'active' => false],
        ]));
    }
}

#[AsTable('text-column-link-template.table')]
final class TextColumnLinkTemplateTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')->link('/customers/{id}')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            ['id' => 1, 'name' => 'Ada Lovelace'],
        ]));
    }
}
