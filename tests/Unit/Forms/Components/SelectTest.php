<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Badge;
use Lattice\Lattice\Ui\Components\Text;

it('serializes static options without search flags', function (): void {
    $field = Select::make('plan', 'Plan')->options([
        Select::option('Free', 'free'),
        Select::option('Pro', 'pro'),
    ]);

    $props = wire($field)['props'];

    expect(wire($field)['type'])->toBe('field.select')
        ->and($props['options'])->toBe([
            ['label' => 'Free', 'value' => 'free', 'data' => null],
            ['label' => 'Pro', 'value' => 'pro', 'data' => null],
        ])
        ->and($props['searchable'])->toBeFalse()
        ->and($props['multiple'])->toBeFalse()
        ->and($field->isSearchable())->toBeFalse();
});

it('serializes the multiple and searchable flags but never the resolver', function (): void {
    $field = Select::make('tags', 'Tags')
        ->multiple()
        ->searchable(fn (string $search): array => []);

    $props = wire($field)['props'];

    expect($props['multiple'])->toBeTrue()
        ->and($props['searchable'])->toBeTrue()
        ->and($props)->not->toHaveKey('searchResolver')
        ->and($field->isSearchable())->toBeTrue();
});

it('runs the search resolver and normalizes options to strings', function (): void {
    $field = Select::make('author_id', 'Author')
        ->searchable(fn (string $search): array => [
            ['label' => 'Jane Doe', 'value' => 5],
            ['label' => 'Janet Roe', 'value' => 9],
        ]);

    $options = $field->resolveSearch('ja', FormData::make([]), Request::create('/'));

    expect($options)->toEqual([
        new Option('Jane Doe', '5'),
        new Option('Janet Roe', '9'),
    ]);
});

it('passes the query to the resolver', function (): void {
    $field = Select::make('city', 'City')
        ->searchable(fn (string $search): array => [
            ['label' => strtoupper($search), 'value' => $search],
        ]);

    expect($field->resolveSearch('berlin', FormData::make([]), Request::create('/')))
        ->toEqual([new Option('BERLIN', 'berlin')]);
});

it('returns no options when the field is not searchable', function (): void {
    $field = Select::make('plan', 'Plan')->options([Select::option('Free', 'free')]);

    expect($field->resolveSearch('x', FormData::make([]), Request::create('/')))->toBe([]);
});

it('serializes the shared focus options', function (): void {
    $node = wire(Select::make('country', 'Country')->autoFocus()->tabIndex(1));

    expect($node['props'])->toMatchArray(['autoFocus' => true, 'tabIndex' => 1]);
});

it('serializes per-option data', function (): void {
    $field = Select::make('customer', 'Customer')->options([
        Select::option('Acme GmbH', '42', ['email' => 'kontakt@acme.de']),
        Select::option('Beta AG', '43'),
    ]);

    expect(wire($field)['props']['options'])->toBe([
        ['label' => 'Acme GmbH', 'value' => '42', 'data' => ['email' => 'kontakt@acme.de']],
        ['label' => 'Beta AG', 'value' => '43', 'data' => null],
    ]);
});

it('expands array options carrying data', function (): void {
    $options = Option::expand([
        ['label' => 'Jane', 'value' => '1', 'data' => ['email' => 'jane@example.com']],
        ['label' => 'Joe', 'value' => '2'],
    ]);

    expect($options[0]->data)->toBe(['email' => 'jane@example.com'])
        ->and($options[1]->data)->toBeNull();
});

it('serializes the option schema only when set', function (): void {
    $plain = Select::make('plan', 'Plan')->options([Select::option('Free', 'free')]);

    expect(wire($plain)['props'])->not->toHaveKey('optionSchema');

    $rich = Select::make('customer', 'Customer')->optionSchema([
        Text::make('')->dataKey('text', 'label'),
        Badge::make('')->dataKey('label', 'number'),
    ]);

    $schema = wire($rich)['props']['optionSchema'];

    expect($schema)->toHaveCount(2)
        ->and($schema[0]['type'])->toBe('text')
        ->and($schema[0]['props']['dataBindings'])->toBe(['text' => 'label'])
        ->and($schema[1]['type'])->toBe('badge')
        ->and($schema[1]['props']['dataBindings'])->toBe(['label' => 'number']);
});

it('keeps per-option data when normalizing resolver options', function (): void {
    $field = Select::make('author_id', 'Author')
        ->searchable(fn (string $search): array => [
            ['label' => 'Jane Doe', 'value' => 5, 'data' => ['email' => 'jane@example.com']],
        ]);

    expect($field->resolveSearch('ja', FormData::make([]), Request::create('/')))
        ->toEqual([new Option('Jane Doe', '5', ['email' => 'jane@example.com'])]);
});

it('keeps per-option data when hydrating selected values', function (): void {
    $field = Select::make('author_id', 'Author')
        ->searchable(fn (): array => [])
        ->resolveSelectedUsing(fn (array $values): array => [
            ['label' => 'Jane Doe', 'value' => $values[0], 'data' => ['email' => 'jane@example.com']],
        ]);

    $field->hydrateState('5');

    expect(wire($field)['props']['options'])->toBe([
        ['label' => 'Jane Doe', 'value' => '5', 'data' => ['email' => 'jane@example.com']],
    ]);
});

describe('docs fixtures', function (): void {
    it('matches the select examples fixture', function (): void {
        assertFixtureMatches('select.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Select::make('country', 'Country')
                ->placeholder('Pick a country')
                ->options([
                    Select::option('Germany', 'de'),
                    Select::option('France', 'fr'),
                    Select::option('Spain', 'es'),
                    Select::option('Italy', 'it'),
                ]),
        ]))));

        assertFixtureMatches('select.multiple', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Select::make('languages', 'Languages')
                ->multiple()
                ->placeholder('Choose languages')
                ->options([
                    Select::option('PHP', 'php'),
                    Select::option('JavaScript', 'js'),
                    Select::option('Go', 'go'),
                    Select::option('Rust', 'rust'),
                ]),
        ]))));
    });
});
