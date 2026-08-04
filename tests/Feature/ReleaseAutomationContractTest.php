<?php

declare(strict_types=1);

it('publishes synchronized npm and Composer packages from one release', function (): void {
    $root = dirname(__DIR__, 2);
    $workflow = file_get_contents($root.'/.github/workflows/release-please.yml');

    expect($workflow)->toContain('npm publish --workspaces --include-workspace-root')
        ->and($workflow)->toContain('danharrin/monorepo-split-github-action@v2.4.0');

    foreach (['action', 'core', 'form', 'media', 'table', 'tree', 'ui'] as $name) {
        $package = json_decode((string) file_get_contents($root.'/packages/'.$name.'/package.json'), true, flags: JSON_THROW_ON_ERROR);

        expect($package)->not->toHaveKey('private')
            ->and($package['publishConfig']['access'])->toBe('public')
            ->and($package['repository']['directory'])->toBe('packages/'.$name)
            ->and($workflow)->toContain("local_path: {$name}")
            ->and($workflow)->toContain("split_repository: {$name}");
    }
});
