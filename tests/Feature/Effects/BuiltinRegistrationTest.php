<?php
declare(strict_types=1);

use Lattice\Lattice\Effects\EffectRegistry;

it('auto-registers all built-in effects in the container', function (): void {
    $registry = app(EffectRegistry::class);

    expect(array_keys($registry->all()))
        ->toContain('toast', 'callout', 'redirect', 'download', 'openModal', 'closeModal', 'reloadPage', 'reloadComponent', 'resetForm', 'localeChange')
        ->and($registry->all())->toHaveCount(10);
});
