<?php
declare(strict_types=1);

use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProductsSearchProvider;
use Orchestra\Testbench\Factories\UserFactory;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\postJson;

beforeEach(function () {
    DiscoveredProductsSearchProvider::$authorized = true;
    DiscoveredProductsSearchProvider::$rows = [['id' => '7', 'title' => 'Canonical Widget']];
    discoverFixtures();
    actingAs(UserFactory::new()->create());
});

test('record re-resolves through the provider and ignores client payload', function () {
    $response = postJson('/lattice/global-search', [
        'category' => 'products',
        'id' => '7',
        'item' => ['title' => 'TAMPERED', 'link' => 'https://evil.example/x'],
    ]);

    $response->assertOk();
    expect($response->json('data.item.title'))->toBe('Canonical Widget')
        ->and($response->json('data.item.link'))->toBe('/products/7')
        ->and($response->json('state.recorded'))->toBeFalse();
});

test('record validates the payload', function () {
    postJson('/lattice/global-search', [])->assertStatus(422);
});

test('record 404s an unknown category and 403s an unauthorized one', function () {
    postJson('/lattice/global-search', ['category' => 'missing', 'id' => '7'])->assertStatus(404);

    DiscoveredProductsSearchProvider::$authorized = false;
    postJson('/lattice/global-search', ['category' => 'products', 'id' => '7'])->assertStatus(403);
});

test('recent returns an empty list with the default recorder', function () {
    actingAs(UserFactory::new()->create());
    $response = \Pest\Laravel\getJson('/lattice/global-search?recent=1');
    $response->assertOk();
    expect($response->json('data'))->toBe([]);
});
