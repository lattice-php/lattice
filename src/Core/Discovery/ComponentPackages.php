<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Discovery;

/**
 * Resolves the discovery roots contributed by installed Composer packages that
 * declare `extra.lattice.discover` in their composer.json — the PHP counterpart
 * to the `extra.lattice.plugin` the Vite plugin reads for the JS renderer. This
 * is what lets a plain `composer require` surface a package's components to
 * definition discovery and TypeScript generation without editing app config.
 */
final class ComponentPackages
{
    /** @return list<string> */
    public static function discoverRoots(): array
    {
        return self::fromInstalled(base_path('vendor/composer/installed.json'));
    }

    /**
     * @return list<string>
     */
    public static function fromInstalled(string $installedJsonPath): array
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
        $roots = [];

        foreach ($packages as $package) {
            $discover = $package['extra']['lattice']['discover'] ?? null;
            $name = $package['name'] ?? null;

            if (! is_array($discover) || ! is_string($name)) {
                continue;
            }

            $installPath = is_string($package['install-path'] ?? null)
                ? $package['install-path']
                : '../'.$name;
            $packageDir = $composerDir.'/'.$installPath;

            foreach ($discover as $relative) {
                if (! is_string($relative)) {
                    continue;
                }

                $resolved = realpath($packageDir.'/'.$relative);

                if ($resolved !== false) {
                    $roots[$resolved] = $resolved;
                }
            }
        }

        return array_values($roots);
    }
}
