<?php
declare(strict_types=1);

use Lattice\Lattice\Http\I18nConfig;

it('serializes a null timezone by default', function (): void {
    config(['lattice.i18n.locales' => ['en', 'de']]);

    expect(wire(I18nConfig::fromConfig()))
        ->toHaveKey('timezone')
        ->and(wire(I18nConfig::fromConfig())['timezone'])->toBeNull();
});

it('serializes the timezone passed to fromConfig', function (): void {
    config(['lattice.i18n.locales' => ['en', 'de']]);

    expect(wire(I18nConfig::fromConfig(timezone: 'Europe/Berlin'))['timezone'])
        ->toBe('Europe/Berlin');
});
