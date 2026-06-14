<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Tables\Columns\TextColumn;

function columnFilterOptionSource(): OptionSource
{
    return new class implements OptionSource
    {
        public function search(string $query): array
        {
            return [new Option('Ada', '1'), new Option('Linus', '2')];
        }

        public function selected(array $values): array
        {
            return [];
        }
    };
}

test('a column with filter options serializes a select control', function () {
    $filter = wire(TextColumn::make('status')->filterOptions([
        ['label' => 'Draft', 'value' => 'draft'],
        ['label' => 'Active', 'value' => 'active'],
    ]))['filter'];

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

test('a multiple column select filter offers the in operators', function () {
    $filter = wire(TextColumn::make('status')->filterOptions([
        ['label' => 'Draft', 'value' => 'draft'],
    ], multiple: true))['filter'];

    expect($filter)->toMatchArray([
        'control' => 'select',
        'multiple' => true,
        'operators' => ['in', 'not_in'],
        'defaultOperator' => 'in',
    ]);
});

test('an operator column filter has no select control', function () {
    $filter = wire(TextColumn::make('name')->filterable())['filter'];

    expect($filter['control'])->toBeNull()
        ->and($filter['options'])->toBe([])
        ->and($filter['multiple'])->toBeFalse();
});

test('a column filter resolves options from an option source', function () {
    $filter = wire(TextColumn::make('author_id')->filterOptions(columnFilterOptionSource()))['filter'];

    expect($filter['control'])->toBe('select')
        ->and($filter['options'])->toBe([
            ['label' => 'Ada', 'value' => '1'],
            ['label' => 'Linus', 'value' => '2'],
        ]);
});

test('a column select filter restricts its available operators', function () {
    expect(TextColumn::make('status')->filterOptions([['label' => 'A', 'value' => 'a']])->availableOperators())
        ->toBe([Op::Equals, Op::NotEquals]);

    expect(TextColumn::make('status')->filterOptions([['label' => 'A', 'value' => 'a']], multiple: true)->availableOperators())
        ->toBe([Op::In, Op::NotIn]);
});
