<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;
use Workbench\App\Models\Tag;
use Workbench\App\Tables\ProductsTable;

/**
 * @param  array<string, string>  $params
 * @return array<int, array<string, mixed>>
 */
function productRows(array $params = []): array
{
    $table = new ProductsTable;

    $query = TableQuery::fromRequest(
        Request::create('/', 'GET', $params),
        $table->columns(),
        'workbench.products',
    );

    return json_decode((string) json_encode($table->source()->query($query)), true)['data'];
}

test('a multiple badge column projects coloured chips onto a flat key without N+1', function (): void {
    $new = Tag::factory()->create(['name' => 'New', 'color' => 'blue']);
    $sale = Tag::factory()->create(['name' => 'Sale', 'color' => 'red']);

    $tagged = Product::factory()->create();
    $tagged->tags()->attach([$new->getKey(), $sale->getKey()]);
    Product::factory()->count(2)->create();

    DB::flushQueryLog();
    DB::enableQueryLog();

    $rows = productRows();

    $taggedRow = collect($rows)->firstWhere('id', $tagged->getKey());
    $untaggedRow = collect($rows)->first(fn (array $row): bool => $row['id'] !== $tagged->getKey());

    expect($taggedRow)->not->toHaveKey('taggables')
        ->and(collect((array) $taggedRow['tags'])->pluck('color', 'value')->all())
        ->toBe(['New' => 'blue', 'Sale' => 'red'])
        ->and($untaggedRow['tags'])->toBe([]);

    $tagQueries = collect(DB::getQueryLog())
        ->filter(fn (array $log): bool => str_contains((string) $log['query'], 'taggables'))
        ->count();

    expect($tagQueries)->toBe(1);
});

test('a multiple column filters through whereHas on the label field', function (): void {
    $new = Tag::factory()->create(['name' => 'New', 'color' => 'blue']);
    $sale = Tag::factory()->create(['name' => 'Sale', 'color' => 'red']);

    $withNew = Product::factory()->create(['name' => 'Has New']);
    $withNew->tags()->attach($new->getKey());
    $withSale = Product::factory()->create(['name' => 'Has Sale']);
    $withSale->tags()->attach($sale->getKey());

    $rows = productRows(['filter' => 'tags:contains:New']);

    expect($rows)->toHaveCount(1)
        ->and($rows[0]['name'])->toBe('Has New');
});
