<?php

declare(strict_types=1);

use Illuminate\Http\Request;
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

    expect($options)->toBe([
        ['label' => 'Jane Doe', 'value' => '5'],
        ['label' => 'Janet Roe', 'value' => '9'],
    ]);
});

it('passes the query to the resolver', function (): void {
    $field = Select::make('city', 'City')
        ->searchable(fn (string $query) => [
            ['label' => strtoupper($query), 'value' => $query],
        ]);

    expect($field->resolveSearch('berlin', FormData::make([]), Request::create('/')))
        ->toBe([['label' => 'BERLIN', 'value' => 'berlin']]);
});

it('returns no options when the field is not searchable', function (): void {
    $field = Select::make('plan', 'Plan')->options([Select::option('Free', 'free')]);

    expect($field->resolveSearch('x', FormData::make([]), Request::create('/')))->toBe([]);
});
