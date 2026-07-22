<?php
declare(strict_types=1);

use Composer\InstalledVersions;
use Illuminate\Support\Facades\Artisan;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

afterEach(function (): void {
    app(DiscoveryManifest::class)->clear();
});

it('surfaces discovery state in the lattice section of php artisan about', function (): void {
    // Workbench mounts app/ from the repo, outside base_path() — pin a path it resolves against.
    config()->set('lattice.discover', [base_path('app')]);

    $signaturePath = InstalledVersions::getInstallPath('lattice-php/signature-example') ?? '';
    $discoverRoot = realpath($signaturePath.'/src');
    $pluginPath = realpath($signaturePath.'/resources/js/plugin.ts');

    Artisan::call('about', ['--json' => true]);
    $data = json_decode((string) Artisan::output(), true);

    expect($data)->toHaveKey('lattice');

    $lattice = $data['lattice'];

    $packageRoot = null;

    foreach ((array) $lattice['package_roots'] as $entry) {
        if (is_array($entry) && ($entry['name'] ?? null) === 'lattice-php/signature-example') {
            $packageRoot = $entry;
        }
    }

    $componentPlugin = null;

    foreach ((array) $lattice['component_plugins'] as $entry) {
        if (is_array($entry) && ($entry['name'] ?? null) === 'lattice-php/signature-example') {
            $componentPlugin = $entry;
        }
    }

    expect($lattice['discover_paths'])->toContain('app')
        ->and($packageRoot)
        ->toMatchArray(['name' => 'lattice-php/signature-example', 'roots' => [str_replace(base_path().'/', '', $discoverRoot)]])
        ->and($componentPlugin)
        ->toMatchArray(['name' => 'lattice-php/signature-example', 'plugin' => str_replace(base_path().'/', '', $pluginPath)])
        ->and($lattice['manifest_cache'])->toMatchArray(['cached' => false]);
});

it('reports the manifest cache path once cached', function (): void {
    $manifest = app(DiscoveryManifest::class);
    $manifest->cache();

    Artisan::call('about', ['--json' => true]);
    $data = json_decode((string) Artisan::output(), true);

    expect($data['lattice']['manifest_cache'])
        ->toMatchArray(['cached' => true, 'path' => $manifest->path()]);
});
