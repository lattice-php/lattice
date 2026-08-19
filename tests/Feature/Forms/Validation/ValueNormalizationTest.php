<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Stringable;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;

enum NormalizedStatus: string
{
    case Active = 'active';
}

enum NormalizedTier
{
    case Gold;
}

it('normalizes a Stringable server value to a plain string', function (): void {
    $definition = testFormDefinition(fn (): array => [
        TextInput::make('name', 'Name')->rules(['required', 'string']),
        TextInput::make('slug', 'Slug')
            ->rules(['string'])
            ->value(fn (FormData $d): Stringable => $d->string('name')->slug()),
    ]);

    $validated = $definition->validate(Request::create('/', 'POST', ['name' => 'Neu Kunde', 'slug' => 'tampered']));

    expect($validated['slug'])->toBe('neu-kunde');
});

it('normalizes enum field values to their scalar representation', function (): void {
    $definition = testFormDefinition(fn (): array => [
        TextInput::make('status', 'Status')->readOnly()->value(NormalizedStatus::Active)->rules(['string']),
        TextInput::make('tier', 'Tier')->readOnly()->value(NormalizedTier::Gold)->rules(['string']),
    ]);

    $validated = $definition->validate(Request::create('/', 'POST', []));

    expect($validated['status'])->toBe('active')
        ->and($validated['tier'])->toBe('Gold');
});

it('normalizes Stringable prefill values', function (): void {
    $definition = testFormDefinition(fn (): array => [
        TextInput::make('name', 'Name'),
        TextInput::make('slug', 'Slug')
            ->value(fn (FormData $form): Stringable => $form->string('name')->slug(), editable: true),
    ]);

    $result = $definition->resolveFields(Request::create('/', 'POST', ['name' => 'Neu Kunde']));

    expect($result->prefill)->toBe(['slug' => 'neu-kunde']);
});
