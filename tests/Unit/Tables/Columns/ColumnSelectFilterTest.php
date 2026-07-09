<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Columns\BooleanColumn;
use Lattice\Lattice\Tables\Columns\ColumnFilterOption;
use Lattice\Lattice\Tables\Columns\TextColumn;

enum ColumnFilterStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
}

test('a column filter accepts an associative value => label array', function (): void {
    $filter = wire(TextColumn::make('status')->filterOptions([
        'draft' => 'Draft',
        'active' => 'Active',
    ]))['props']['filter'];

    expect($filter['options'])->toBe([
        ['label' => 'Draft', 'value' => 'draft'],
        ['label' => 'Active', 'value' => 'active'],
    ]);
});

test('a column filter accepts an enum', function (): void {
    $filter = wire(TextColumn::make('status')->filterOptions(ColumnFilterStatus::class))['props']['filter'];

    expect($filter['options'])->toBe([
        ['label' => 'Draft', 'value' => 'draft'],
        ['label' => 'Active', 'value' => 'active'],
    ]);
});

test('a column with filter options serializes a select control', function (): void {
    $filter = wire(TextColumn::make('status')->filterOptions([
        ['label' => 'Draft', 'value' => 'draft'],
        ['label' => 'Active', 'value' => 'active'],
    ]))['props']['filter'];

    expect($filter)->toMatchArray([
        'enabled' => true,
        'control' => 'select',
        'multiple' => false,
        'options' => [
            ['label' => 'Draft', 'value' => 'draft'],
            ['label' => 'Active', 'value' => 'active'],
        ],
        'operators' => ['eq', 'neq'],
        'defaultOperator' => 'eq',
    ]);
});

test('a multiple column select filter offers the in operators', function (): void {
    $filter = wire(TextColumn::make('status')->filterOptions([
        ['label' => 'Draft', 'value' => 'draft'],
    ], multiple: true))['props']['filter'];

    expect($filter)->toMatchArray([
        'control' => 'select',
        'multiple' => true,
        'operators' => ['in', 'not_in'],
        'defaultOperator' => 'in',
    ]);
});

test('an operator column filter has no select control', function (): void {
    $filter = wire(TextColumn::make('name')->filterable())['props']['filter'];

    expect($filter['control'])->toBeNull()
        ->and($filter['options'])->toBe([])
        ->and($filter['multiple'])->toBeFalse();
});

test('a column filter can be made searchable', function (): void {
    $filter = wire(TextColumn::make('author_id')->filterOptions(inMemoryOptionSource(['1' => 'Ada', '2' => 'Linus']), searchable: true))['props']['filter'];

    expect($filter['control'])->toBe('select')
        ->and($filter['searchable'])->toBeTrue();
});

test('a static column select filter is not searchable', function (): void {
    $filter = wire(TextColumn::make('status')->filterOptions([['label' => 'A', 'value' => 'a']]))['props']['filter'];

    expect($filter['searchable'])->toBeFalse();
});

test('a column filter resolves options from an option source', function (): void {
    $filter = wire(TextColumn::make('author_id')->filterOptions(inMemoryOptionSource(['1' => 'Ada', '2' => 'Linus'])))['props']['filter'];

    expect($filter['control'])->toBe('select')
        ->and($filter['options'])->toBe([
            ['label' => 'Ada', 'value' => '1'],
            ['label' => 'Linus', 'value' => '2'],
        ]);
});

test('a column select filter restricts its available operators', function (): void {
    expect(TextColumn::make('status')->filterOptions([['label' => 'A', 'value' => 'a']])->availableOperators())
        ->toBe([Op::Equals, Op::NotEquals]);

    expect(TextColumn::make('status')->filterOptions([['label' => 'A', 'value' => 'a']], multiple: true)->availableOperators())
        ->toBe([Op::In, Op::NotIn]);
});

test('a column filter serializes clause options', function (): void {
    $filter = wire(BooleanColumn::make('featured')->filterOptions([
        ColumnFilterOption::clause('Yes', 'yes', Op::Equals, 'true'),
        ColumnFilterOption::clause('No', 'no', Op::Equals, 'false'),
        ColumnFilterOption::clause('Unset', 'unset', Op::Empty),
    ]))['props']['filter'];

    expect($filter)->toMatchArray([
        'control' => 'select',
        'options' => [
            ['label' => 'Yes', 'value' => 'yes'],
            ['label' => 'No', 'value' => 'no'],
            ['label' => 'Unset', 'value' => 'unset'],
        ],
        'clauseOptions' => [
            [
                'label' => 'Yes',
                'value' => 'yes',
                'clauses' => [['operator' => 'eq', 'value' => 'true']],
            ],
            [
                'label' => 'No',
                'value' => 'no',
                'clauses' => [['operator' => 'eq', 'value' => 'false']],
            ],
            [
                'label' => 'Unset',
                'value' => 'unset',
                'clauses' => [['operator' => 'empty', 'value' => '']],
            ],
        ],
        'operators' => ['eq', 'neq', 'empty'],
    ]);
});

test('a column filter range option serializes date bounds as clauses', function (): void {
    $filter = wire(TextColumn::make('updated_at')->date()->filterOptions([
        ColumnFilterOption::range('This month', 'this-month', '2026-06-01', '2026-06-30'),
    ]))['props']['filter'];

    expect($filter)->toMatchArray([
        'options' => [
            ['label' => 'This month', 'value' => 'this-month'],
        ],
        'clauseOptions' => [
            [
                'label' => 'This month',
                'value' => 'this-month',
                'clauses' => [
                    ['operator' => 'gte', 'value' => '2026-06-01'],
                    ['operator' => 'lte', 'value' => '2026-06-30'],
                ],
            ],
        ],
        'operators' => ['eq', 'neq', 'gte', 'lte'],
    ]);
});
