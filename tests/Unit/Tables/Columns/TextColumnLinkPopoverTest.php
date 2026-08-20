<?php
declare(strict_types=1);

use Lattice\Table\Columns\TextColumn;
use Lattice\Ui\Components\Text;

it('rejects a popover on a column that already carries a link', function (): void {
    TextColumn::make('name')
        ->link('/customers/{value}')
        ->popover(fn (array $row): ?Text => null);
})->throws(InvalidArgumentException::class, 'A text column can carry only one of a link or a popover.');

it('rejects a link on a column that already carries a popover', function (): void {
    TextColumn::make('name')
        ->popover(fn (array $row): ?Text => null)
        ->link('/customers/{value}');
})->throws(InvalidArgumentException::class, 'A text column can carry only one of a link or a popover.');

it('rejects a closure link on a column that already carries a popover', function (): void {
    TextColumn::make('name')
        ->popover(fn (array $row): ?Text => null)
        ->link(fn (array $row): string => '/customers/'.$row['id']);
})->throws(InvalidArgumentException::class, 'A text column can carry only one of a link or a popover.');

it('allows re-setting the same link twice', function (): void {
    $column = TextColumn::make('name')->link('/a')->link('/b');

    expect($column->link)->toBe(['href' => '/b', 'external' => false]);
});

it('allows re-setting the same popover twice', function (): void {
    $column = TextColumn::make('name')
        ->popover(fn (array $row): ?Text => null)
        ->popover(fn (array $row): Text => Text::make('again'));

    expect($column->hasPopover())->toBeTrue();
});
