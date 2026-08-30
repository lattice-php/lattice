<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\InvalidTableQuery;
use Lattice\Table\TableQuery;

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

it('throws for an unfilterable field in strict mode', function (): void {
    $columns = [TextColumn::make('name')];

    TableQuery::fromRequest(new Request(['filter' => 'name:eq:acme']), $columns, 'demo');
})->throws(InvalidTableQuery::class);

it('drops an unfilterable field instead of throwing in non-strict mode', function (): void {
    $columns = [TextColumn::make('name')];

    $query = TableQuery::fromRequest(new Request(['filter' => 'name:eq:acme']), $columns, 'demo', strict: false);

    expect($query->filters)->toBe([]);
});

it('drops an unknown operator instead of throwing in non-strict mode', function (): void {
    $columns = [TextColumn::make('name')->filterable()];

    $query = TableQuery::fromRequest(new Request(['filter' => 'name:bogus:acme']), $columns, 'demo', strict: false);

    expect($query->filters)->toBe([]);
});

it('keeps a valid filter clause in non-strict mode', function (): void {
    $columns = [TextColumn::make('name')->filterable()];

    $query = TableQuery::fromRequest(new Request(['filter' => 'name:eq:acme']), $columns, 'demo', strict: false);

    expect($query->filters)->toHaveCount(1)
        ->and($query->filters[0]->field)->toBe('name');
});

it('drops an unsortable key instead of throwing in non-strict mode', function (): void {
    $columns = [TextColumn::make('name')];

    $query = TableQuery::fromRequest(new Request(['sort' => 'name']), $columns, 'demo', strict: false);

    expect($query->sorts)->toBe([]);
});

it('throws for an unsortable key in strict mode', function (): void {
    $columns = [TextColumn::make('name')];

    TableQuery::fromRequest(new Request(['sort' => 'name']), $columns, 'demo');
})->throws(InvalidTableQuery::class);

it('drops an unknown tf key instead of throwing in non-strict mode', function (): void {
    $query = TableQuery::fromRequest(
        Request::create('/', 'GET', ['tf' => ['bogus' => ['value' => 'x']]]),
        [],
        'demo',
        strict: false,
    );

    expect($query->tableFilters)->toBe([]);
});

it('throws for an unknown tf key in strict mode', function (): void {
    TableQuery::fromRequest(
        Request::create('/', 'GET', ['tf' => ['bogus' => ['value' => 'x']]]),
        [],
        'demo',
    );
})->throws(InvalidTableQuery::class);
