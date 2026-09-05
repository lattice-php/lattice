<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Gate;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Search\SearchProviderRegistry;
use Lattice\Tests\Fixtures\SearchGate\DeclaredOnlySearchProvider;
use Lattice\Tests\Fixtures\SearchGate\GatedSearchProvider;
use Lattice\Tests\Fixtures\SearchGate\UnresolvableSubjectSearchProvider;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

beforeEach(function (): void {
    config(['lattice.discover' => []]);
    app(DiscoveryManifest::class)->clear();
    app()->singleton(GatedSearchProvider::class);
    app(SearchProviderRegistry::class)->register(GatedSearchProvider::class);
});

it('hides a provider whose declared ability is denied', function (): void {
    app(GatedSearchProvider::class)->withWorkspace();
    Gate::define('invoices.view', fn (?object $user, object $workspace): bool => false);

    getJson('/lattice/search?query=invoice&counts=1')
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonCount(0, 'categories');
});

it('shows a provider whose declared ability passes against the resolved subject', function (): void {
    $provider = app(GatedSearchProvider::class)->withWorkspace();
    Gate::define('invoices.view', fn (?object $user, object $workspace): bool => $workspace === $provider->workspace);

    getJson('/lattice/search?query=invoice&counts=1')
        ->assertOk()
        ->assertJsonPath('data.0.item.title', 'Invoice 2026-001');
});

it('denies a provider whose gate subject resolves to nothing', function (): void {
    Gate::define('invoices.view', fn (): bool => true);

    getJson('/lattice/search?query=invoice&counts=1')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('applies the declared ability to a recorded selection too', function (): void {
    app(GatedSearchProvider::class)->withWorkspace();
    Gate::define('invoices.view', fn (): bool => false);

    postJson('/lattice/search', ['category' => 'invoices', 'id' => '1'])->assertForbidden();
});

it('refuses to register a provider that declares on without resolving a subject', function (): void {
    expect(fn () => app(SearchProviderRegistry::class)->register(UnresolvableSubjectSearchProvider::class))
        ->toThrow(InvalidArgumentException::class, 'ResolvesGateSubject');
});

it('gates a provider whose only gate is the declaration, with no authorize() written', function (bool $allowed, int $results): void {
    app(SearchProviderRegistry::class)->register(DeclaredOnlySearchProvider::class);
    Gate::define('memos.view', fn (?object $user): bool => $allowed);

    getJson('/lattice/search?query=memo')
        ->assertOk()
        ->assertJsonCount($results, 'data');
})->with([
    'denied' => [false, 0],
    'allowed' => [true, 1],
]);
