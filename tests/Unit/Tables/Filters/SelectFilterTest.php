<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Filters\SelectFilter;
use Workbench\App\Models\Product;

test('select filter serializes its wire shape', function (): void {
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

test('select filter defaults its label from the key', function (): void {
    expect(wire(SelectFilter::make('order_status'))['label'])->toBe('Order Status');
});

test('a single select filter applies an equality constraint', function (): void {
    $builder = Product::query();

    SelectFilter::make('status')->apply($builder, 'active');

    expect($builder->toSql())->toContain('"status" = ?')
        ->and($builder->getBindings())->toBe(['active']);
});

test('a multiple select filter applies a whereIn constraint', function (): void {
    $builder = Product::query();

    SelectFilter::make('status')->multiple()->apply($builder, ['active', 'draft']);

    expect($builder->toSql())->toContain('"status" in (?, ?)')
        ->and($builder->getBindings())->toBe(['active', 'draft']);
});

test('a select filter without a value applies no constraint', function (): void {
    $builder = Product::query();

    SelectFilter::make('status')->apply($builder, '');

    expect($builder->toSql())->not->toContain('where');
});

test('a multiple select filter with no selected values applies no constraint', function (): void {
    $builder = Product::query();

    SelectFilter::make('status')->multiple()->apply($builder, []);

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
