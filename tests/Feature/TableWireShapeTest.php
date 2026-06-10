<?php

declare(strict_types=1);

use Lattice\Lattice\Facades\Lattice;
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
            TextColumn::make('name')->label('Name')->sortable()->filterable(),
            TextColumn::make('price')->label('Price')->numeric(),
        ])
        ->layout('table')
        ->striped(true)
        ->result(TableResult::make([['name' => 'A'], ['name' => 'B']]), TableQuery::empty());

    $payload = json_decode(json_encode($table), true);

    expect($payload['type'])->toBe('table');
    expect($payload['props']['endpoint'])->toBe('/tables/demo');
    expect($payload['props']['striped'])->toBeTrue();
    expect($payload['props'])->not->toHaveKey('layout');
    expect($payload['props']['columns'][0])->toMatchArray([
        'key' => 'name',
        'label' => 'Name',
        'type' => 'text',
        'sortable' => true,
    ]);
    expect($payload['props']['columns'][0])->toHaveKey('filter');
    expect($payload['props']['data'])->toBe([['name' => 'A'], ['name' => 'B']]);
    expect($payload['props']['state'])->toBe([
        'filters' => [],
        'sorts' => [],
        'page' => 1,
        'perPage' => 25,
    ]);
    expect($payload['props'])->not->toHaveKey('bulkActions');
});

it('keeps empty data present on a lazy table (wire trap)', function (): void {
    Lattice::tables([ProductsTable::class]);

    $table = app(TableRegistry::class)->lazyComponent(ProductsTable::class);

    $payload = json_decode(json_encode($table), true);

    expect($payload['type'])->toBe('table');
    expect($payload['props']['lazy'])->toBeTrue();
    expect($payload['props']['striped'])->toBeTrue();
    expect($payload['props'])->toHaveKey('data');
    expect($payload['props']['data'])->toBe([]);
    expect($payload['props']['pagination']['mode'])->toBe('table');
    expect($payload['props']['columns'])->toHaveCount(6);
    expect($payload['props']['bulkActions'][0]['type'])->toBe('bulkAction');
});
