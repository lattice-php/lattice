<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\DateInput;
use Lattice\Lattice\Support\Wire;

it('serializes a date input', function (): void {
    $node = wire(DateInput::make('due', 'Due date')->min('2026-01-01')->max('2026-12-31'));

    expect($node['type'])->toBe('field.date-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'due',
            'label' => 'Due date',
            'min' => '2026-01-01',
            'max' => '2026-12-31',
        ]);
});

describe('docs fixtures', function (): void {
    it('matches the date input example fixture', function (): void {
        assertFixtureMatches('date-input.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            DateInput::make('birthday', 'Birthday')->max('2026-01-01'),
        ]))));
    });
});
