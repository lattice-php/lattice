<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\DateInput;

it('serializes a date input', function (): void {
    $node = wire(DateInput::make('due', 'Due date')->min('2026-01-01')->max('2026-12-31'));

    expect($node['type'])->toBe('form.date-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'due',
            'label' => 'Due date',
            'min' => '2026-01-01',
            'max' => '2026-12-31',
        ]);
});

describe('docs fixtures', function (): void {
    it('dumps the date input example', function (): void {
        dumpFixture('date-input.basic', [
            DateInput::make('birthday', 'Birthday')->max('2026-01-01'),
        ]);

        expect('docs/fixtures/date-input.basic.json')->toBeReadableFile();
    });
});
