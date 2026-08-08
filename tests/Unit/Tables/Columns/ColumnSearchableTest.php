<?php
declare(strict_types=1);

use Lattice\Table\Columns\TextColumn;

it('keeps the searchable flag off the wire props', function (): void {
    $props = wire(TextColumn::make('name')->searchable())['props'];

    expect($props)->not->toHaveKey('searchable')
        ->and($props)->not->toHaveKey('searchableEnabled');
});
