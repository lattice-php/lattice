<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Tables\TableQuery;

it('parses the q param into a trimmed search term', function (): void {
    $query = TableQuery::fromRequest(new Request(['q' => '  acme  ']), [], 'demo');

    expect($query->search)->toBe('acme');
});

it('defaults the search term to an empty string', function (): void {
    expect(TableQuery::fromRequest(new Request, [], 'demo')->search)->toBe('')
        ->and(TableQuery::empty()->search)->toBe('');
});

it('serializes the search term onto the wire query', function (): void {
    $query = TableQuery::fromRequest(new Request(['q' => 'acme']), [], 'demo');

    expect($query->jsonSerialize())->toHaveKey('search', 'acme');
});
