<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;

it('serializes static options without search flags', function (): void {
    $field = Select::make('plan', 'Plan')->options([
        Select::option('Free', 'free'),
        Select::option('Pro', 'pro'),
    ]);

    $props = wire($field)['props'];

    expect(wire($field)['type'])->toBe('form.select')
        ->and($props['options'])->toBe([
            ['label' => 'Free', 'value' => 'free'],
            ['label' => 'Pro', 'value' => 'pro'],
        ])
        ->and($props['searchable'])->toBeNull()
        ->and($props['multiple'])->toBeNull()
        ->and($field->isSearchable())->toBeFalse();
});

it('serializes the multiple and searchable flags but never the resolver', function (): void {
    $field = Select::make('tags', 'Tags')
        ->multiple()
        ->searchable(fn (string $query) => []);

    $props = wire($field)['props'];

    expect($props['multiple'])->toBeTrue()
        ->and($props['searchable'])->toBeTrue()
        ->and($props)->not->toHaveKey('searchResolver')
        ->and($field->isSearchable())->toBeTrue();
});

it('runs the search resolver and normalizes options to strings', function (): void {
    $field = Select::make('author_id', 'Author')
        ->searchable(fn (string $query) => [
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
        ->searchable(fn (string $query) => [
            ['label' => strtoupper($query), 'value' => $query],
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

describe('docs fixtures', function (): void {
    it('dumps the select examples', function (): void {
        dumpFixture('select.basic', [
            Select::make('country', 'Country')
                ->placeholder('Pick a country')
                ->options([
                    Select::option('Germany', 'de'),
                    Select::option('France', 'fr'),
                    Select::option('Spain', 'es'),
                    Select::option('Italy', 'it'),
                ]),
        ]);

        dumpFixture('select.multiple', [
            Select::make('languages', 'Languages')
                ->multiple()
                ->placeholder('Choose languages')
                ->options([
                    Select::option('PHP', 'php'),
                    Select::option('JavaScript', 'js'),
                    Select::option('Go', 'go'),
                    Select::option('Rust', 'rust'),
                ]),
        ]);

        expect('docs/fixtures/select.basic.json')->toBeReadableFile()
            ->and('docs/fixtures/select.multiple.json')->toBeReadableFile();
    });
});
