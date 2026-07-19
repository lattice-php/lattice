<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\FormData;

function makeField(string $name = 'price', string $label = 'Price'): Field
{
    return (new class extends Field
    {
        protected function type(): string
        {
            return 'field.test-field';
        }
    })::make($name, $label);
}

it('exposes its name and serializes name/label', function (): void {
    $field = makeField();

    expect($field->name())->toBe('price')
        ->and(wire($field)['props'])->toMatchArray(['name' => 'price', 'label' => 'Price']);
});

it('resolves array rules', function (): void {
    $field = makeField()->rules(['required', 'numeric']);

    expect($field->resolveRules(FormData::make([]), Request::create('/')))
        ->toBe(['required', 'numeric']);
});

it('resolves closure rules with form data', function (): void {
    $field = makeField()->rules(fn (FormData $data): array => $data->get('type') === 'member'
        ? ['required', 'numeric']
        : ['nullable']);

    expect($field->resolveRules(FormData::make(['type' => 'member']), Request::create('/')))
        ->toBe(['required', 'numeric'])
        ->and($field->resolveRules(FormData::make(['type' => 'guest']), Request::create('/')))
        ->toBe(['nullable']);
});

it('merges rules across calls, including closures', function (): void {
    $field = makeField()
        ->rules(['required'])
        ->rules(fn (): array => ['string'])
        ->rules(['max:10']);

    expect($field->resolveRules(FormData::make([]), Request::create('/')))
        ->toBe(['required', 'string', 'max:10']);
});

it('serializes helper text', function (): void {
    $field = makeField()->helperText('Shown to buyers.');

    expect(wire($field)['props']['helperText'])->toBe('Shown to buyers.');
});

it('aliases hint to helper text', function (): void {
    $field = makeField()->hint('Quick tip.');

    expect(wire($field)['props']['helperText'])->toBe('Quick tip.');
});

it('serializes a tooltip', function (): void {
    $field = makeField()->tooltip('See <a href="/docs">the docs</a>.');

    expect(wire($field)['props']['tooltip'])->toBe('See <a href="/docs">the docs</a>.');
});

it('serializes tooltip as null when not set', function (): void {
    expect(wire(makeField())['props']['tooltip'])->toBeNull();
});
