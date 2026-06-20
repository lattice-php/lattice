<?php
declare(strict_types=1);

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Lattice\Forms\Components\DateTimeInput;
use Lattice\Lattice\Forms\FieldValidator;

it('serializes a datetime input', function (): void {
    $node = wire(DateTimeInput::make('starts_at', 'Starts at')
        ->min('2026-01-01T00:00:00 Europe/Berlin')
        ->max('2026-12-31T23:59:59 Europe/Berlin')
        ->step(900));

    expect($node['type'])->toBe('field.date-time-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'starts_at',
            'label' => 'Starts at',
            'min' => '2026-01-01T00:00:00 Europe/Berlin',
            'max' => '2026-12-31T23:59:59 Europe/Berlin',
            'step' => 900,
            'convertTimezone' => false,
            'timezone' => null,
        ]);
});

it('casts submitted datetime to CarbonImmutable in the submitted timezone', function (): void {
    $validated = (new FieldValidator)->validate(
        [DateTimeInput::make('starts_at', 'Starts at')],
        Request::create('/', 'POST', ['starts_at' => '2026-06-19T14:30:00 Europe/Berlin']),
    );

    expect($validated['starts_at'])->toBeInstanceOf(CarbonImmutable::class)
        ->and($validated['starts_at']->format('Y-m-d H:i:s e P'))
        ->toBe('2026-06-19 14:30:00 Europe/Berlin +02:00');
});

it('converts submitted datetime to the configured app timezone when requested', function (): void {
    config()->set('app.timezone', 'America/New_York');

    $validated = (new FieldValidator)->validate(
        [DateTimeInput::make('starts_at', 'Starts at')->convertTimeZone()],
        Request::create('/', 'POST', ['starts_at' => '2026-06-19T14:30:00 Europe/Berlin']),
    );

    expect($validated['starts_at'])->toBeInstanceOf(CarbonImmutable::class)
        ->and($validated['starts_at']->format('Y-m-d H:i:s e P'))
        ->toBe('2026-06-19 08:30:00 America/New_York -04:00');
});

it('converts submitted datetime to an explicit timezone when requested', function (): void {
    $validated = (new FieldValidator)->validate(
        [DateTimeInput::make('starts_at', 'Starts at')->convertTimeZone('America/New_York')],
        Request::create('/', 'POST', ['starts_at' => '2026-06-19T14:30:00 Europe/Berlin']),
    );

    expect($validated['starts_at'])->toBeInstanceOf(CarbonImmutable::class)
        ->and($validated['starts_at']->format('Y-m-d H:i:s e P'))
        ->toBe('2026-06-19 08:30:00 America/New_York -04:00');
});

it('rejects datetimes without an IANA timezone', function (): void {
    expect(fn (): array => (new FieldValidator)->validate(
        [DateTimeInput::make('starts_at', 'Starts at')],
        Request::create('/', 'POST', ['starts_at' => '2026-06-19T14:30:00']),
    ))->toThrow(ValidationException::class);
});

it('hydrates Carbon values to datetime plus timezone', function (): void {
    $field = DateTimeInput::make('starts_at', 'Starts at');
    $field->hydrateState(CarbonImmutable::parse('2026-06-19 14:30:00', 'Europe/Berlin'));

    expect(wire($field)['props']['value'])->toBe('2026-06-19T14:30:00 Europe/Berlin');
});

describe('docs fixtures', function (): void {
    it('dumps the datetime input example', function (): void {
        dumpFixture('date-time-input.basic', [
            DateTimeInput::make('starts_at', 'Starts at'),
        ]);

        expect('docs/fixtures/date-time-input.basic.json')->toBeReadableFile();
    });
});
