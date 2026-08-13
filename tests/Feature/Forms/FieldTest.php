<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Form\Components\Field;
use Lattice\Form\FormData;
use Lattice\Ui\Components\Link;

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

it('serializes a tooltip, defaulting to null when not set', function (): void {
    expect(wire(makeField())['props']['tooltip'])->toBeNull();

    $field = makeField()->tooltip('See <a href="/docs">the docs</a>.');

    expect(wire($field)['props']['tooltip'])->toBe('See <a href="/docs">the docs</a>.');
});

it('serializes a label action as a wire node, defaulting to null', function (): void {
    expect(wire(makeField())['props']['labelAction'])->toBeNull();

    $props = wire(makeField()->labelAction(Link::make('Need help?')->href('/help')))['props'];

    expect($props['labelAction']['type'])->toBe('link')
        ->and($props['labelAction']['props'])->toMatchArray(['label' => 'Need help?', 'href' => '/help']);
});

it('serializes a hidden label action to null', function (): void {
    $field = makeField()->labelAction(Link::make('Need help?')->href('/help')->hidden());

    expect(wire($field)['props']['labelAction'])->toBeNull();
});
