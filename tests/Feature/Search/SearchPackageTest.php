<?php
declare(strict_types=1);

use Lattice\Core\Discovery\ComponentPackages;

use function Pest\Laravel\getJson;

it('is discovered as a component package', function (): void {
    $package = collect(ComponentPackages::packages())
        ->first(fn (array $package): bool => $package['name'] === 'lattice-php/search');

    expect($package)
        ->not->toBeNull()
        ->and($package['standalone'] ?? null)
        ->toBe(realpath(dirname(__DIR__, 3).'/packages/search/dist/plugin.js'));
});

it('serves its translated interface strings', function (): void {
    getJson('/locales/de/search.json')
        ->assertOk()
        ->assertJsonPath('search.placeholder', 'Suchen…')
        ->assertJsonPath('search.load-more', 'Mehr laden')
        ->assertJsonPath('search.open', 'Öffnen');
});
