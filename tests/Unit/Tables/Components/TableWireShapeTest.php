<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableRegistry;
use Lattice\Lattice\Tables\TableResult;
use Workbench\App\Tables\ProductsTable;

it('serializes the table component wire shape', function (): void {
    $table = Table::make('demo')
        ->endpoint('/tables/demo')
        ->columns([
            TextColumn::make('name')->label('Name')->width(ColumnWidth::Lg)->sortable()->filterable(),
            NumberColumn::make('price')->label('Price'),
        ])
        ->layout('table')
        ->striped(true)
        ->result(TableResult::make([['name' => 'A'], ['name' => 'B']]), TableQuery::empty());

    $payload = wire($table);

    expect($payload['type'])->toBe('table');
    expect($payload['props']['endpoint'])->toBe('/tables/demo');
    expect($payload['props']['striped'])->toBeTrue();
    expect($payload['props']['layout'])->toBeNull();
    expect($payload['props']['resizeIndicator'])->toBeFalse();
    expect($payload['props']['columns'][0])->toMatchArray([
        'key' => 'name',
        'type' => 'column.text',
    ]);
    expect($payload['props']['columns'][0]['props'])->toMatchArray([
        'label' => 'Name',
        'width' => 'lg',
        'sortable' => true,
    ]);
    expect($payload['props']['columns'][1]['props']['width'])->toBe('md');
    expect($payload['props']['columns'][0]['props'])->toHaveKey('filter');
    expect($payload['props']['data'])->toBe([['name' => 'A'], ['name' => 'B']]);
    expect($payload['props']['state'])->toBe([
        'filters' => [],
        'sorts' => [],
        'page' => 1,
        'perPage' => 25,
        'tableFilters' => [],
    ]);
    expect($payload['props']['bulkActions'])->toBe([]);
    expect($payload['props']['filters'])->toBe([]);
});

it('serializes visible resize indicators on table components', function (): void {
    $payload = wire(Table::make('demo')->resizableColumns(showIndicator: true));

    expect($payload['props']['resizableColumns'])->toBeTrue()
        ->and($payload['props']['resizeIndicator'])->toBeTrue();
});

it('defaults a column to its value type operator set', function (): void {
    $column = TextColumn::make('name')->filterable();

    expect($column->availableOperators())
        ->toBe([
            Op::Contains,
            Op::StartsWith,
            Op::EndsWith,
            Op::Equals,
            Op::NotEquals,
            Op::Empty,
            Op::Filled,
        ]);
});

it('narrows the offered operators when a column restricts them', function (): void {
    $column = TextColumn::make('name')->filterable(
        Op::Equals,
        [Op::Equals, Op::Contains],
    );

    expect($column->availableOperators())->toBe([Op::Equals, Op::Contains]);

    $filter = wire($column)['props']['filter'];

    expect($filter['operators'])->toBe(['eq', 'contains'])
        ->and($filter['defaultOperator'])->toBe('eq');
});

it('keeps empty data present on a lazy table (wire trap)', function (): void {
    Lattice::tables([ProductsTable::class]);

    $table = app(TableRegistry::class)->lazyComponent(ProductsTable::class);

    $payload = wire($table);

    expect($payload['type'])->toBe('table');
    expect($payload['props']['lazy'])->toBeTrue();
    expect($payload['props']['striped'])->toBeTrue();
    expect($payload['props'])->toHaveKey('data');
    expect($payload['props']['data'])->toBe([]);
    expect($payload['props']['pagination']['mode'])->toBe('table');
    expect($payload['props']['columns'])->toHaveCount(8);
    expect($payload['props']['bulkActions'][0]['type'])->toBe('bulkAction');
});
