<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Workbench\App\Models\Product;
use Workbench\App\Models\Tag;
use Workbench\App\Tables\ProductsTable;

test('a multiple badge column projects coloured chips onto a flat key without N+1', function (): void {
    $new = Tag::factory()->create(['name' => 'New', 'color' => 'blue']);
    $sale = Tag::factory()->create(['name' => 'Sale', 'color' => 'red']);

    $tagged = Product::factory()->create();
    $tagged->tags()->attach([$new->getKey(), $sale->getKey()]);
    Product::factory()->count(2)->create();

    DB::flushQueryLog();
    DB::enableQueryLog();

    $rows = tableRows(new ProductsTable);

    $taggedRow = collect($rows)->firstWhere('id', $tagged->getKey())
        ?? throw new RuntimeException('Tagged row not found.');
    $untaggedRow = collect($rows)->first(fn (array $row): bool => $row['id'] !== $tagged->getKey())
        ?? throw new RuntimeException('Untagged row not found.');

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

    $rows = tableRows(new ProductsTable, ['filter' => 'tags:contains:New']);

    expect($rows)->toHaveCount(1)
        ->and($rows[0]['name'])->toBe('Has New');
});
