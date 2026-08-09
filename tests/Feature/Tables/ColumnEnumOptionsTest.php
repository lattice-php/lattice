<?php
declare(strict_types=1);

use Lattice\Core\Contracts\HasLabel;
use Lattice\Table\Columns\BadgeColumn;
use Lattice\Table\Columns\TextColumn;

enum ColumnEnumStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
}

enum LabelledColumnEnumStatus: string implements HasLabel
{
    case Active = 'active';
    case Archived = 'archived';

    public function getLabel(): string
    {
        return __("column-enum-status.{$this->value}");
    }
}

it('serializes value options from an enum for the cell label lookup', function (): void {
    $props = wire(BadgeColumn::make('status')->enum(ColumnEnumStatus::class))['props'];

    expect($props['options'])->toBe([
        ['label' => 'Draft', 'value' => 'draft', 'data' => null],
        ['label' => 'Active', 'value' => 'active', 'data' => null],
    ]);
});

it('translates value option labels through the HasLabel contract', function (): void {
    app('translator')->addLines([
        'column-enum-status.active' => 'Aktiv',
        'column-enum-status.archived' => 'Archiviert',
    ], 'de');
    app()->setLocale('de');

    $props = wire(BadgeColumn::make('status')->enum(LabelledColumnEnumStatus::class))['props'];

    expect($props['options'])->toBe([
        ['label' => 'Aktiv', 'value' => 'active', 'data' => null],
        ['label' => 'Archiviert', 'value' => 'archived', 'data' => null],
    ]);
});

it('a plain column without enum() keeps an empty options list', function (): void {
    $props = wire(TextColumn::make('name'))['props'];

    expect($props['options'])->toBe([]);
});

it('derives a select filter from enum() when filterOptions() was never called', function (): void {
    $filter = wire(BadgeColumn::make('status')->enum(ColumnEnumStatus::class)->filterable())['props']['filter'];

    expect($filter)->toMatchArray([
        'control' => 'filter.select',
        'options' => [
            ['label' => 'Draft', 'value' => 'draft', 'data' => null],
            ['label' => 'Active', 'value' => 'active', 'data' => null],
        ],
        'operators' => ['eq', 'neq'],
        'defaultOperator' => 'eq',
    ]);
});

it('lets an explicit filterOptions() override the enum-derived filter', function (): void {
    $filter = wire(BadgeColumn::make('status')
        ->enum(ColumnEnumStatus::class)
        ->filterOptions(['draft' => 'Only draft']))['props']['filter'];

    expect($filter['options'])->toBe([
        ['label' => 'Only draft', 'value' => 'draft', 'data' => null],
    ]);
});

it('does not filter a column that never called filterable()', function (): void {
    $filter = wire(BadgeColumn::make('status')->enum(ColumnEnumStatus::class))['props']['filter'];

    expect($filter)->toBeNull();
});
