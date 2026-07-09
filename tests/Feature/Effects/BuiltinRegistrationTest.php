<?php
declare(strict_types=1);

use Lattice\Lattice\Effects\EffectRegistry;

it('auto-registers all built-in effects in the container', function (): void {
    $registry = app(EffectRegistry::class);

    expect(array_keys($registry->all()))
        ->toContain('toast', 'callout', 'redirect', 'download', 'open-modal', 'close-modal', 'reload-page', 'reload-component', 'reset-form', 'locale-change', 'toggle-sidebar')
        ->and($registry->all())->toHaveCount(11);
});
