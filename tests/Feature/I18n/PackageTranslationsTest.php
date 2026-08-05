<?php
declare(strict_types=1);

use Lattice\Core\Facades\Lattice;

use function Pest\Laravel\getJson;

it('registers a package lang namespace for the translator and the i18next route', function (): void {
    Lattice::translations('zzpkg', dirname(__DIR__, 2).'/Fixtures/I18n/lang');

    expect(__('zzpkg::messages.greeting'))->toBe('Hello from the package');

    getJson('/locales/en/zzpkg::messages.json')
        ->assertOk()
        ->assertJsonPath('greeting', 'Hello from the package');
});
