<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\DateInput;

it('serializes a date input', function (): void {
    $node = DateInput::make('due', 'Due date')->min('2026-01-01')->max('2026-12-31')->toArray();

    expect($node['type'])->toBe('form.date-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'due',
            'label' => 'Due date',
            'min' => '2026-01-01',
            'max' => '2026-12-31',
        ]);
});
