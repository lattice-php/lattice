<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Discovery;

use Composer\InstalledVersions;
use ReflectionClass;

/**
 * Resolves the discovery roots contributed by installed Composer packages that
 * declare `extra.lattice.discover` in their composer.json — the PHP counterpart
 * to the `extra.lattice.plugin` the Vite plugin reads for the JS renderer. This
 * is what lets a plain `composer require` surface a package's components to
 * definition discovery and TypeScript generation without editing app config.
 *
 * Also reads the composer ROOT project's own `extra.lattice` (see
 * `rootPackage()`), since `installed.json` never lists it — the mechanism a
 * component package's own testbench-driven test suite relies on to discover
 * its own `src/` declaratively.
 */
final class ComponentPackages
{
    /** @return list<string> */
    public static function discoverRoots(): array
    {
        return self::rootsOf(self::packages());
    }

    /**
     * @return list<string>
     */
    public static function fromInstalled(string $installedJsonPath): array
    {
        return self::rootsOf(self::packagesFromInstalled($installedJsonPath));
    }

    /**
     * Includes the composer ROOT project — it never appears in `installed.json`.
     *
     * @return list<array{name: string, roots: list<string>, plugin: string|null}>
     */
    public static function packages(): array
    {
        $file = new ReflectionClass(InstalledVersions::class)->getFileName();

        $installed = is_string($file)
            ? self::packagesFromInstalled(dirname($file).'/installed.json')
            : [];

        return [...$installed, ...self::rootPackage()];
    }

    /**
     * The composer ROOT project's own `extra.lattice`, read from its
     * composer.json — Composer never lists the root package in
     * `installed.json`, so without this a component package that declares
     * `extra.lattice.discover` would be invisible to discovery inside its own
     * testbench-driven test suite, where the package itself is the root.
     *
     * @return list<array{name: string, roots: list<string>, plugin: string|null}>
     */
    public static function rootPackage(): array
    {
        $resolved = realpath(InstalledVersions::getRootPackage()['install_path']);

        return $resolved !== false
            ? self::packagesFromRootComposerJson($resolved.'/composer.json')
            : [];
    }

    /**
     * @return list<array{name: string, roots: list<string>, plugin: string|null}>
     */
    public static function packagesFromRootComposerJson(string $composerJsonPath): array
    {
        if (! is_file($composerJsonPath)) {
            return [];
        }

        $data = json_decode((string) file_get_contents($composerJsonPath), true);

        if (! is_array($data)) {
            return [];
        }

        $lattice = $data['extra']['lattice'] ?? null;
        $name = $data['name'] ?? null;

        if (! is_array($lattice) || ! is_string($name)) {
            return [];
        }

        $package = self::resolvePackage($name, $lattice, dirname($composerJsonPath));

        return $package !== null ? [$package] : [];
    }

    /**
     * @return list<array{name: string, roots: list<string>, plugin: string|null}>
     */
    public static function packagesFromInstalled(string $installedJsonPath): array
    {
        if (! is_file($installedJsonPath)) {
            return [];
        }

        $data = json_decode((string) file_get_contents($installedJsonPath), true);

        if (! is_array($data)) {
            return [];
        }

        /** @var list<array<string, mixed>> $packages */
        $packages = is_array($data['packages'] ?? null) ? $data['packages'] : [];
        $composerDir = dirname($installedJsonPath);
        $result = [];

        foreach ($packages as $package) {
            $lattice = $package['extra']['lattice'] ?? null;
            $name = $package['name'] ?? null;

            if (! is_array($lattice) || ! is_string($name)) {
                continue;
            }

            $installPath = is_string($package['install-path'] ?? null)
                ? $package['install-path']
                : '../'.$name;

            $resolvedPackage = self::resolvePackage($name, $lattice, $composerDir.'/'.$installPath);

            if ($resolvedPackage !== null) {
                $result[] = $resolvedPackage;
            }
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $lattice
     * @return array{name: string, roots: list<string>, plugin: string|null}|null
     */
    private static function resolvePackage(string $name, array $lattice, string $packageDir): ?array
    {
        $discover = is_array($lattice['discover'] ?? null) ? $lattice['discover'] : [];
        $plugin = is_string($lattice['plugin'] ?? null) ? $lattice['plugin'] : null;

        if ($discover === [] && $plugin === null) {
            return null;
        }

        $roots = [];

        foreach ($discover as $relative) {
            if (! is_string($relative)) {
                continue;
            }

            $resolved = realpath($packageDir.'/'.$relative);

            if ($resolved !== false) {
                $roots[$resolved] = $resolved;
            }
        }

        return [
            'name' => $name,
            'roots' => array_values($roots),
            'plugin' => $plugin !== null ? (realpath($packageDir.'/'.$plugin) ?: null) : null,
        ];
    }

    /**
     * @param  list<array{name: string, roots: list<string>, plugin: string|null}>  $packages
     * @return list<string>
     */
    private static function rootsOf(array $packages): array
    {
        $roots = [];

        foreach ($packages as $package) {
            foreach ($package['roots'] as $root) {
                $roots[$root] = $root;
            }
        }

        return array_values($roots);
    }
}
