<?php
declare(strict_types=1);

use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProductsSearchProvider;
use Orchestra\Testbench\Factories\UserFactory;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

beforeEach(function () {
    DiscoveredProductsSearchProvider::$authorized = true;
    DiscoveredProductsSearchProvider::$rows = array_map(
        fn (int $n): array => ['id' => (string) $n, 'title' => "Widget {$n}"],
        range(1, 25),
    );
    discoverFixtures();
    actingAs(UserFactory::new()->create());
});

test('config exposes the default endpoint and middleware', function () {
    expect(config('lattice.global-search.endpoint'))->toBe('lattice/global-search');
    expect(config('lattice.global-search.middleware'))->toBe(['web', 'auth']);
});

test('search returns the closed response envelope', function () {
    $response = getJson('/lattice/global-search?query=Widget&category=products&per_page=10');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['category' => ['name'], 'item' => ['id', 'title', 'subtitle', 'additionalInfo', 'link', 'badge']]],
            'categories' => [['name', 'label', 'icon', 'count']],
            'pagination' => ['page', 'perPage', 'total', 'hasMore', 'nextPage'],
            'state' => ['query', 'category', 'perPage', 'countsIncluded'],
        ]);

    expect($response->json('pagination.total'))->toBe(25)
        ->and($response->json('pagination.hasMore'))->toBeTrue()
        ->and($response->json('pagination.nextPage'))->toBe(2)
        ->and($response->json('data'))->toHaveCount(10)
        ->and($response->json('data.0.category.name'))->toBe('products')
        ->and($response->json('state.query'))->toBe('Widget');
});

test('counts are present only when requested', function () {
    expect(getJson('/lattice/global-search?query=Widget&category=products')->json('categories.0.count'))->toBeNull();
    expect(getJson('/lattice/global-search?query=Widget&category=products&counts=1')->json('categories.0.count'))->toBe(25);
    expect(getJson('/lattice/global-search?query=Widget&category=products')->json('state.countsIncluded'))->toBeFalse();
});

test('unauthorized providers are excluded', function () {
    DiscoveredProductsSearchProvider::$authorized = false;

    $response = getJson('/lattice/global-search?query=Widget');

    expect($response->json('categories'))->toBe([])
        ->and($response->json('data'))->toBe([]);
});

test('search validates pagination parameters', function () {
    getJson('/lattice/global-search?per_page=999')->assertStatus(422);
    getJson('/lattice/global-search?page=0')->assertStatus(422);
});
