<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\TimeInput;
use Lattice\Lattice\Forms\FieldValidator;
use Lattice\Lattice\Support\Wire;

it('serializes a time input', function (): void {
    $node = wire(TimeInput::make('starts_at', 'Start time')->min('08:00')->max('18:00')->step(900));

    expect($node['type'])->toBe('field.time-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'starts_at',
            'label' => 'Start time',
            'min' => '08:00',
            'max' => '18:00',
            'step' => 900,
        ]);
});

it('validates and returns a time string', function (): void {
    $validated = (new FieldValidator)->validate(
        [TimeInput::make('starts_at', 'Start time')],
        Request::create('/', 'POST', ['starts_at' => '14:30']),
    );

    expect($validated['starts_at'])->toBe('14:30');
});

it('accepts seconds when submitted', function (): void {
    $validated = (new FieldValidator)->validate(
        [TimeInput::make('starts_at', 'Start time')],
        Request::create('/', 'POST', ['starts_at' => '14:30:15']),
    );

    expect($validated['starts_at'])->toBe('14:30:15');
});

it('rejects malformed time values', function (): void {
    expect(fn (): array => (new FieldValidator)->validate(
        [TimeInput::make('starts_at', 'Start time')],
        Request::create('/', 'POST', ['starts_at' => '25:99']),
    ))->toThrow(ValidationException::class);
});

describe('docs fixtures', function (): void {
    it('matches the time input example fixture', function (): void {
        assertFixtureMatches('time-input.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            TimeInput::make('starts_at', 'Start time')->min('08:00')->max('18:00'),
        ]))));
    });
});
