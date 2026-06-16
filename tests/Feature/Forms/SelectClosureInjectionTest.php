<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;

it('injects the search string and form utilities into search resolvers', function () {
    $field = Select::make('user')->searchable(
        fn ($search, $get) => [new Option($search.'/'.$get('scope'), '1')],
    );

    $options = $field->resolveSearch('ada', FormData::make(['scope' => 'admins']), Request::create('/'));

    expect($options)->toHaveCount(1)
        ->and($options[0]->label)->toBe('ada/admins');
});

it('injects selected values into the selected resolver', function () {
    $field = Select::make('user')->resolveSelectedUsing(
        fn ($values) => array_map(fn (string $value) => new Option('User '.$value, $value), $values),
    );

    $field->hydrateState(['7']);

    expect($field->options)->toHaveCount(1)
        ->and($field->options[0]->label)->toBe('User 7');
});
