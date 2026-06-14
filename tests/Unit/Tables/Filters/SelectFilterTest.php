<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Filters\SelectFilter;
use Workbench\App\Models\Product;

test('select filter serializes its wire shape', function () {
    expect(wire(SelectFilter::make('status')
        ->label('Status')
        ->options([
            SelectFilter::option('Draft', 'draft'),
            SelectFilter::option('Active', 'active'),
        ])))
        ->toBe([
            'key' => 'status',
            'label' => 'Status',
            'type' => 'select',
            'props' => [
                'options' => [
                    ['label' => 'Draft', 'value' => 'draft'],
                    ['label' => 'Active', 'value' => 'active'],
                ],
                'multiple' => false,
                'searchable' => false,
                'placeholder' => null,
            ],
        ]);
});

test('select filter defaults its label from the key', function () {
    expect(wire(SelectFilter::make('order_status'))['label'])->toBe('Order Status');
});

test('a single select filter applies an equality constraint', function () {
    $builder = Product::query();

    SelectFilter::make('status')->apply($builder, 'active');

    expect($builder->toSql())->toContain('"status" = ?')
        ->and($builder->getBindings())->toBe(['active']);
});

test('a multiple select filter applies a whereIn constraint', function () {
    $builder = Product::query();

    SelectFilter::make('status')->multiple()->apply($builder, ['active', 'draft']);

    expect($builder->toSql())->toContain('"status" in (?, ?)')
        ->and($builder->getBindings())->toBe(['active', 'draft']);
});

test('a select filter without a value applies no constraint', function () {
    $builder = Product::query();

    SelectFilter::make('status')->apply($builder, '');

    expect($builder->toSql())->not->toContain('where');
});
