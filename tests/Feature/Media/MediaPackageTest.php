<?php
declare(strict_types=1);

use Lattice\Core\Discovery\ComponentPackages;

use function Pest\Laravel\getJson;

test('the media package is discovered with config and plugin', function (): void {
    expect(config('media.disk'))->toBe('public')
        ->and(config('media.max_size'))->toBe(10240);

    $package = collect(ComponentPackages::packages())
        ->first(fn (array $package): bool => $package['name'] === 'lattice-php/media');

    expect($package)->not->toBeNull();
});

// The i18next loader prefixes every key with its PHP lang group (the file name),
// so the JS keys in the `media` namespace must carry the `media.` prefix.
test('the media namespace serves the keys the react components ask for', function (): void {
    getJson('/locales/de/media.json')
        ->assertOk()
        ->assertJsonPath('media.library.search', 'Medien suchen')
        ->assertJsonPath('media.filters.type.all', 'Alle Typen')
        ->assertJsonPath('media.picker.confirm', '{{count}} Element(e) auswählen')
        ->assertJsonPath('media.library.select', '{{name}} auswählen')
        ->assertJsonPath('media.detail.save', 'Speichern');
});
