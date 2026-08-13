<?php
declare(strict_types=1);

use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Search\Contracts\SearchHistoryRecorder;
use Lattice\Search\SearchProviderRegistry;
use Lattice\Tests\Fixtures\Search\FakeSearchProvider;
use Lattice\Tests\Fixtures\Search\InMemorySearchHistoryRecorder;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

beforeEach(function (): void {
    config(['lattice.discover' => []]);
    app(DiscoveryManifest::class)->clear();
    app()->singleton(FakeSearchProvider::class);
    app(SearchProviderRegistry::class)->register(FakeSearchProvider::class);
    $history = new InMemorySearchHistoryRecorder;
    app()->instance(SearchHistoryRecorder::class, $history);
    app()->instance(InMemorySearchHistoryRecorder::class, $history);
});

it('searches an authorized provider with pagination and category counts', function (): void {
    getJson('/lattice/search?query=desk&counts=1&per_page=1')
        ->assertOk()
        ->assertJsonPath('data.0.item.title', 'Desk Lamp')
        ->assertJsonPath('categories.0.name', 'products')
        ->assertJsonPath('categories.0.count', 1)
        ->assertJsonPath('pagination.total', 1)
        ->assertJsonPath('pagination.hasMore', false)
        ->assertJsonPath('state.category', 'products')
        ->assertJsonPath('state.mode', 'results');
});

it('omits providers that reject the request', function (): void {
    app(FakeSearchProvider::class)->authorized = false;

    getJson('/lattice/search?query=desk&counts=1')
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonCount(0, 'categories');
});

it('records and returns only a result re-resolved by its provider', function (): void {
    postJson('/lattice/search', ['category' => 'products', 'id' => '2'])
        ->assertOk()
        ->assertJsonPath('data.item.title', 'Office Chair')
        ->assertJsonPath('state.recorded', true);

    expect(app(InMemorySearchHistoryRecorder::class)->recorded)->toHaveCount(1);

    getJson('/lattice/search?recent=1&per_page=5')
        ->assertOk()
        ->assertJsonPath('data.0.item.title', 'Office Chair')
        ->assertJsonPath('state.mode', 'recent');
});

it('does not record an unknown result', function (): void {
    postJson('/lattice/search', ['category' => 'products', 'id' => 'missing'])
        ->assertNotFound();

    expect(app(InMemorySearchHistoryRecorder::class)->recorded)->toBe([]);
});

it('hides recent selections when their provider is no longer authorized', function (): void {
    postJson('/lattice/search', ['category' => 'products', 'id' => '2'])
        ->assertOk();

    app(FakeSearchProvider::class)->authorized = false;

    getJson('/lattice/search?recent=1')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('validates search and selection input', function (): void {
    getJson('/lattice/search?page=0&per_page=101')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['page', 'per_page']);

    postJson('/lattice/search', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['category', 'id']);
});
