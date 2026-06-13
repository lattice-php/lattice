<?php

declare(strict_types=1);

use function Orchestra\Testbench\package_path;

test('published lattice endpoints require authentication by default', function (): void {
    /** @var array<string, mixed> $defaults */
    $defaults = require package_path('config/lattice.php');

    foreach (['forms', 'tables', 'fragments', 'actions', 'bulk-actions'] as $group) {
        $groupConfig = $defaults[$group] ?? null;

        expect($groupConfig)->toBeArray();
        assert(is_array($groupConfig));

        expect($groupConfig['middleware'] ?? null)->toBe(['web', 'auth']);
    }
});
