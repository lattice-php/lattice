<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\SearchBox;
use Lattice\Lattice\Core\Components\SearchInput;
use Lattice\Lattice\Core\Components\SearchResults;

test('the root serializes its props and nested slots', function () {
    $node = wire(
        SearchBox::make('search')
            ->endpoint('/lattice/search')
            ->placeholder('Search…')
            ->title('Search')
            ->schema([
                SearchInput::make(),
                SearchResults::make(),
            ]),
    );

    expect($node)->toMatchArray([
        'type' => 'search.box',
        'props' => [
            'endpoint' => '/lattice/search',
            'placeholder' => 'Search…',
            'title' => 'Search',
            'shortcut' => true,
            'perPage' => 20,
        ],
    ]);

    expect($node['schema'][0]['type'])->toBe('search.input');
    expect($node['schema'][1]['type'])->toBe('search.results');
});
