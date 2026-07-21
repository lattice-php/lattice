<?php

declare(strict_types=1);

use Composer\InstalledVersions;
use Lattice\Lattice\Core\Discovery\ComponentPackages;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Support\TypeScript\WireTypeDiscovery;

it('resolves discover roots from packages that declare extra.lattice.discover', function (): void {
    $roots = ComponentPackages::fromInstalled(
        __DIR__.'/../../Fixtures/PackageDiscovery/composer/installed.json',
    );

    expect($roots)->toBe([
        realpath(__DIR__.'/../../Fixtures/PackageDiscovery/acme/widget/src'),
    ]);
});

it('returns nothing when installed.json is absent', function (): void {
    expect(ComponentPackages::fromInstalled('/no/such/installed.json'))->toBe([]);
});

it('maps installed packages to their name, roots and plugin entry', function (): void {
    $packages = ComponentPackages::packagesFromInstalled(
        __DIR__.'/../../Fixtures/PackageDiscovery/composer/installed.json',
    );

    expect($packages)->toBe([
        [
            'name' => 'acme/widget',
            'roots' => [realpath(__DIR__.'/../../Fixtures/PackageDiscovery/acme/widget/src')],
            'plugin' => realpath(__DIR__.'/../../Fixtures/PackageDiscovery/acme/widget/resources/js/plugin.ts'),
        ],
    ]);
});

it('returns no packages when installed.json is absent', function (): void {
    expect(ComponentPackages::packagesFromInstalled('/no/such/installed.json'))->toBe([]);
});

it('resolves the root package from its own composer.json extra.lattice', function (): void {
    $packages = ComponentPackages::packagesFromRootComposerJson(
        __DIR__.'/../../Fixtures/PackageDiscovery/root-package/composer.json',
    );

    expect($packages)->toBe([
        [
            'name' => 'acme/root-widget',
            'roots' => [realpath(__DIR__.'/../../Fixtures/PackageDiscovery/root-package/src')],
            'plugin' => realpath(__DIR__.'/../../Fixtures/PackageDiscovery/root-package/resources/js/plugin.ts'),
        ],
    ]);
});

it('returns nothing for a root composer.json without extra.lattice', function (): void {
    $packages = ComponentPackages::packagesFromRootComposerJson(
        __DIR__.'/../../Fixtures/PackageDiscovery/root-plain/composer.json',
    );

    expect($packages)->toBe([]);
});

it('returns nothing when the root composer.json is absent', function (): void {
    expect(ComponentPackages::packagesFromRootComposerJson('/no/such/composer.json'))->toBe([]);
});

it('reads the root package via Composer\InstalledVersions::getRootPackage()', function (): void {
    // Under this package's own testbench suite, the composer ROOT project is
    // this repo itself — it declares no extra.lattice, so the real root
    // resolution should degrade to no packages rather than throwing.
    expect(ComponentPackages::rootPackage())->toBe([]);
});

it('merges installed component-package roots into the configured discover paths', function (): void {
    $packagePath = InstalledVersions::getInstallPath('lattice-php/signature-example') ?? '';
    $discoverPath = realpath($packagePath.'/src');

    expect($discoverPath)->not->toBeFalse();

    expect(DiscoveryManifest::configuredPaths())->toContain(
        $discoverPath,
    );
});

it('discovers a vendor package component so lattice:typescript can type it', function (): void {
    $discovery = app(WireTypeDiscovery::class);

    $types = [];

    foreach (DiscoveryManifest::configuredPaths() as $path) {
        foreach ($discovery->discover($path)->components as $component) {
            $types[] = $component->type;
        }
    }

    expect($types)->toContain('signature');
});
