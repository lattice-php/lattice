<?php
declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Search\SearchProviderRegistry;
use Lattice\Search\SearchQuery;
use Lattice\Search\SearchResult;
use Lattice\Tests\Fixtures\SearchGate\ProductSearchProvider;
use Workbench\App\Models\Product;

use function Pest\Laravel\getJson;

function productSearchQuery(string $term, int $page = 1, int $perPage = 10): SearchQuery
{
    return new SearchQuery($term, 'workbench-products', $page, $perPage, 'en');
}

beforeEach(function (): void {
    config(['lattice.discover' => []]);
    app(DiscoveryManifest::class)->clear();
    app(SearchProviderRegistry::class)->register(ProductSearchProvider::class);
});

it('matches a term against the declared columns and orders by the base query', function (): void {
    Product::factory()->create(['name' => 'Office Chair']);
    Product::factory()->create(['name' => 'Desk Lamp']);
    Product::factory()->create(['name' => 'Notebook']);

    $results = app(ProductSearchProvider::class)->search(productSearchQuery('desk'));

    expect($results->total)->toBe(1)
        ->and($results->rows[0]->item->title)->toBe('Desk Lamp');
});

it('counts and pages the same query', function (): void {
    Product::factory()->create(['name' => 'Desk Lamp']);
    Product::factory()->create(['name' => 'Desk Mat']);
    Product::factory()->create(['name' => 'Desk Pad']);

    $provider = app(ProductSearchProvider::class);

    expect($provider->count(productSearchQuery('desk')))->toBe(3)
        ->and($provider->search(productSearchQuery('desk', perPage: 2))->rows)->toHaveCount(2)
        ->and($provider->search(productSearchQuery('desk', page: 2, perPage: 2))->rows)->toHaveCount(1)
        ->and($provider->search(productSearchQuery('desk', perPage: 2))->total)->toBe(3);
});

it('matches everything for an empty term, the way the palette opens', function (): void {
    Product::factory()->create(['name' => 'Desk Lamp']);
    Product::factory()->create(['name' => 'Notebook']);

    expect(app(ProductSearchProvider::class)->count(productSearchQuery('')))->toBe(2);
});

it('escapes a wildcard in the term rather than binding it as one', function (): void {
    DB::enableQueryLog();

    app(ProductSearchProvider::class)->count(productSearchQuery('100%'));

    expect(DB::getQueryLog()[0]['bindings'][0] ?? null)->toBe('%100\\%%');
});

it('re-resolves a recorded selection through the base query', function (): void {
    $product = Product::factory()->create(['name' => 'Desk Lamp']);
    $provider = app(ProductSearchProvider::class);

    expect($provider->resolve((string) $product->getKey(), request()))->toBeInstanceOf(SearchResult::class)
        ->and($provider->resolve('missing', request()))->toBeNull();
});

it('serves the category over the search endpoint', function (): void {
    Product::factory()->create(['name' => 'Desk Lamp']);

    getJson('/lattice/search?query=desk&counts=1')
        ->assertOk()
        ->assertJsonPath('data.0.item.title', 'Desk Lamp')
        ->assertJsonPath('categories.0.count', 1);
});
