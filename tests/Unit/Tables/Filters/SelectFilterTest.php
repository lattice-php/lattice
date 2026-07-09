<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Filters\SelectFilter;
use Workbench\App\Models\Product;

test('select filter serializes its wire shape', function (): void {
    $filter = wire(SelectFilter::make('status')
        ->label('Status')
        ->options([
            SelectFilter::option('Draft', 'draft'),
            SelectFilter::option('Active', 'active'),
        ]));

    expect($filter)->toMatchArray([
        'key' => 'status',
        'label' => 'Status',
        'type' => 'filter.select',
        'props' => [
            'multiple' => false,
            'searchable' => false,
            'options' => [
                ['label' => 'Draft', 'value' => 'draft'],
                ['label' => 'Active', 'value' => 'active'],
            ],
            'placeholder' => null,
        ],
    ])
        ->and($filter['schema'])->toHaveCount(1)
        ->and($filter['schema'][0]['type'])->toBe('field.select')
        ->and($filter['schema'][0]['props']['name'])->toBe('value');
});

test('select filter defaults its label from the key', function (): void {
    expect(wire(SelectFilter::make('order_status'))['label'])->toBe('Order Status');
});

test('a single select filter applies an equality constraint', function (): void {
    $builder = Product::query();

    SelectFilter::make('status')->apply($builder, FormData::make(['value' => 'active']));

    expect($builder->toSql())->toContain('"status" = ?')
        ->and($builder->getBindings())->toBe(['active']);
});

test('a multiple select filter applies a whereIn constraint', function (): void {
    $builder = Product::query();

    SelectFilter::make('status')->multiple()->apply($builder, FormData::make(['value' => ['active', 'draft']]));

    expect($builder->toSql())->toContain('"status" in (?, ?)')
        ->and($builder->getBindings())->toBe(['active', 'draft']);
});

test('a select filter without a value applies no constraint', function (): void {
    $builder = Product::query();

    SelectFilter::make('status')->apply($builder, FormData::make(['value' => '']));

    expect($builder->toSql())->not->toContain('where');
});

test('a multiple select filter with no selected values applies no constraint', function (): void {
    $builder = Product::query();

    SelectFilter::make('status')->multiple()->apply($builder, FormData::make(['value' => []]));

    expect($builder->toSql())->not->toContain('where');
});

test('a select filter accepts an associative value => label array', function (): void {
    $props = wire(SelectFilter::make('status')->options(['draft' => 'Draft', 'active' => 'Active']))['props'];

    expect($props['options'])->toBe([
        ['label' => 'Draft', 'value' => 'draft'],
        ['label' => 'Active', 'value' => 'active'],
    ]);
});

test('a select filter resolves its options from an option source', function (): void {
    $source = inMemoryOptionSource(['1' => 'Ada', '2' => 'Linus']);

    $props = wire(SelectFilter::make('author_id')->optionsFrom($source))['props'];

    expect($props['options'])->toBe([
        ['label' => 'Ada', 'value' => '1'],
        ['label' => 'Linus', 'value' => '2'],
    ]);
});
