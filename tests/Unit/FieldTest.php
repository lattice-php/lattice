<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Form\Field;
use Bambamboole\Lattice\Forms\FormData;
use Illuminate\Http\Request;

function makeField(string $name = 'price', string $label = 'Price'): Field
{
    return (new class extends Field
    {
        protected function type(): string
        {
            return 'form.test-field';
        }
    })->props(['name' => $name, 'label' => $label]);
}

it('exposes its name and serializes name/label', function (): void {
    $field = makeField();

    expect($field->name())->toBe('price')
        ->and($field->toArray()['props'])->toMatchArray(['name' => 'price', 'label' => 'Price']);
});

it('resolves array rules', function (): void {
    $field = makeField()->rules(['required', 'numeric']);

    expect($field->resolveRules(FormData::make([]), Request::create('/')))
        ->toBe(['required', 'numeric']);
});

it('resolves closure rules with form data', function (): void {
    $field = makeField()->rules(fn (FormData $data) => $data->get('type') === 'member'
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
        ->rules(fn () => ['string'])
        ->rules(['max:10']);

    expect($field->resolveRules(FormData::make([]), Request::create('/')))
        ->toBe(['required', 'string', 'max:10']);
});
