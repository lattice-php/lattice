<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableSource;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\Tag;

/**
 * Run a global-search query against an Eloquent source over the given columns.
 *
 * @template TModel of \Illuminate\Database\Eloquent\Model
 *
 * @param  Closure(TableQuery): Builder<TModel>  $builder
 * @param  array<int, TextColumn>  $columns
 * @param  array<string, string>  $extra
 * @return array<int, array<string, mixed>>
 */
function searchData(Closure $builder, array $columns, string $term, array $extra = []): array
{
    $source = new EloquentTableSource($builder, $columns, PaginationType::None);
    $query = TableQuery::fromRequest(
        Request::create('/', 'GET', ['q' => $term, ...$extra]),
        $columns,
        'demo',
    );

    return $source->query($query)->data;
}

test('matches a term across multiple searchable columns with OR', function (): void {
    BusinessPartner::factory()->create(['name' => 'Acme Corp', 'email' => 'a@example.com']);
    BusinessPartner::factory()->create(['name' => 'Bob', 'email' => 'bob@acme.test']);
    BusinessPartner::factory()->create(['name' => 'Zoe', 'email' => 'zoe@example.com']);

    $rows = searchData(fn () => BusinessPartner::query(), [
        TextColumn::make('name')->searchable(),
        TextColumn::make('email')->searchable(),
    ], 'acme');

    expect(array_column($rows, 'name'))->toEqualCanonicalizing(['Acme Corp', 'Bob']);
});

test('never matches a column that is not searchable', function (): void {
    BusinessPartner::factory()->create(['name' => 'Acme Corp', 'email' => 'a@example.com']);
    BusinessPartner::factory()->create(['name' => 'Bob', 'email' => 'bob@acme.test']);

    $rows = searchData(fn () => BusinessPartner::query(), [
        TextColumn::make('name')->searchable(),
        TextColumn::make('email'),
    ], 'acme');

    expect(array_column($rows, 'name'))->toBe(['Acme Corp']);
});

test('is a no-op when no column is searchable', function (): void {
    BusinessPartner::factory()->count(3)->create();

    $rows = searchData(fn () => BusinessPartner::query(), [
        TextColumn::make('name'),
        TextColumn::make('email'),
    ], 'anything');

    expect($rows)->toHaveCount(3);
});

test('returns all rows when the term is blank', function (): void {
    BusinessPartner::factory()->count(3)->create();

    $rows = searchData(fn () => BusinessPartner::query(), [TextColumn::make('name')->searchable()], '   ');

    expect($rows)->toHaveCount(3);
});

test('combines the search group with column filters using AND', function (): void {
    BusinessPartner::factory()->create(['name' => 'Acme One', 'email' => 'one@acme.test']);
    BusinessPartner::factory()->create(['name' => 'Acme Two', 'email' => 'two@other.test']);

    $rows = searchData(fn () => BusinessPartner::query(), [
        TextColumn::make('name')->searchable()->filterable(),
        TextColumn::make('email')->searchable()->filterable(),
    ], 'acme', ['filter' => 'email:contains:acme']);

    expect(array_column($rows, 'name'))->toBe(['Acme One']);
});

test('escapes LIKE wildcards in the term before it reaches the database', function (): void {
    BusinessPartner::factory()->create(['name' => 'anything']);

    DB::flushQueryLog();
    DB::enableQueryLog();

    searchData(fn () => BusinessPartner::query(), [TextColumn::make('name')->searchable()], '50%');

    $bindings = collect(DB::getQueryLog())->pluck('bindings')->flatten();

    expect($bindings)->toContain('%50\%%');
});

test('matches a to-one relation column through whereHas', function (): void {
    $acme = BusinessPartner::factory()->create(['name' => 'Acme']);
    $globex = BusinessPartner::factory()->create(['name' => 'Globex']);
    SalesOrder::factory()->create(['business_partner_id' => $acme->getKey(), 'number' => 'SO-A']);
    SalesOrder::factory()->create(['business_partner_id' => $globex->getKey(), 'number' => 'SO-G']);

    $rows = searchData(fn () => SalesOrder::query()->select(['id', 'business_partner_id', 'number']), [
        TextColumn::make('number')->searchable(),
        TextColumn::make('businessPartner.name')->searchable(),
    ], 'acme');

    expect(array_column($rows, 'number'))->toBe(['SO-A']);
});

test('matches a to-many relation column through whereHas', function (): void {
    $new = Tag::factory()->create(['name' => 'New']);
    $sale = Tag::factory()->create(['name' => 'Sale']);
    Product::factory()->create(['name' => 'Product A'])->tags()->attach($new->getKey());
    Product::factory()->create(['name' => 'Product B'])->tags()->attach($sale->getKey());

    $rows = searchData(fn () => Product::query(), [
        TextColumn::make('name')->searchable(),
        TextColumn::make('tags')->multiple('name')->searchable(),
    ], 'sale');

    expect(array_column($rows, 'name'))->toBe(['Product B']);
});

test('applies the search to resolveMatching for bulk actions', function (): void {
    BusinessPartner::factory()->create(['name' => 'Acme Corp']);
    BusinessPartner::factory()->create(['name' => 'Bob']);

    $columns = [TextColumn::make('name')->searchable()];
    $source = new EloquentTableSource(fn () => BusinessPartner::query(), $columns, PaginationType::None);
    $query = TableQuery::fromRequest(Request::create('/', 'GET', ['q' => 'acme']), $columns, 'demo');

    $matching = $source->resolveMatching($query);

    expect($matching)->toHaveCount(1)
        ->and($matching->first()->name)->toBe('Acme Corp');
});
