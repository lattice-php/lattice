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
