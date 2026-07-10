<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;

it('injects the search string and form utilities into search resolvers', function (): void {
    $field = Select::make('user')->searchable(
        fn ($search, $get): array => [new Option($search.'/'.$get('scope'), '1')],
    );

    $options = $field->resolveSearch('ada', FormData::make(['scope' => 'admins']), Request::create('/'));

    expect($options)->toHaveCount(1)
        ->and($options[0]->label)->toBe('ada/admins');
});

it('injects selected values into the selected resolver', function (): void {
    $field = Select::make('user')->resolveSelectedUsing(
        fn ($values): array => array_map(fn (string $value): Option => new Option('User '.$value, $value), $values),
    );

    $field->hydrateState(['7']);

    expect($field->options)->toHaveCount(1)
        ->and($field->options[0]->label)->toBe('User 7');
});

it('injects form utilities into the selected resolver when hydrating from a bound form', function (): void {
    $field = Select::make('user')->resolveSelectedUsing(
        fn (array $values, callable $get, Request $request): array => array_map(
            fn (string $value): Option => new Option($get('scope').'/'.$value, $value),
            $values,
        ),
    );

    $field->hydrateState(['7'], FormData::make(['scope' => 'admins']), Request::create('/'));

    expect($field->options)->toHaveCount(1)
        ->and($field->options[0]->label)->toBe('admins/7');
});
