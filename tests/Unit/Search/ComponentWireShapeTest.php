<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\GlobalSearch;
use Lattice\Lattice\Core\Components\GlobalSearchInput;
use Lattice\Lattice\Core\Components\GlobalSearchResults;

test('the root serializes its props and nested slots', function () {
    $node = wire(
        GlobalSearch::make('global-search')
            ->endpoint('/lattice/search')
            ->placeholder('Search…')
            ->title('Search')
            ->schema([
                GlobalSearchInput::make(),
                GlobalSearchResults::make(),
            ]),
    );

    expect($node)->toMatchArray([
        'type' => 'global-search.root',
        'props' => [
            'endpoint' => '/lattice/search',
            'placeholder' => 'Search…',
            'title' => 'Search',
            'shortcut' => true,
            'perPage' => 20,
        ],
    ]);

    expect($node['schema'][0]['type'])->toBe('global-search.input');
    expect($node['schema'][1]['type'])->toBe('global-search.results');
});
