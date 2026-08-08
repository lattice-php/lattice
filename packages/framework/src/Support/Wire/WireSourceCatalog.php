<?php
declare(strict_types=1);

namespace Lattice\Support\Wire;

use Composer\InstalledVersions;
use ReflectionClass;

/**
 * The composer-derived wire source catalog: every installed package that
 * declares `extra.lattice.discover`, plus the composer ROOT package (which
 * never appears in `installed.json`, mirroring
 * `Lattice\Core\Discovery\ComponentPackages::rootPackage()`). Replaces the
 * imperative `LatticeRegistry::wireSource()` registration — a package's wire
 * surface is declared once, in its composer.json, the same key
 * `ComponentPackages` already reads for JS/PHP component discovery.
 */
final readonly class WireSourceCatalog
{
    /**
     * @param  list<array<string, mixed>>  $installed  decoded `packages` entries from installed.json
     * @param  array<string, mixed>  $rootComposer  decoded root composer.json
     */
    public function __construct(
        private array $installed,
        private array $rootComposer,
        private string $composerDir,
        private string $rootDir,
    ) {}

    /**
     * Resolves via the ACTUAL Composer runtime (installed.json next to the
     * `Composer\InstalledVersions` class file, the real root package's own
     * install path) rather than Laravel's `base_path()` — identical to
     * `Lattice\Core\Discovery\ComponentPackages`, for the identical reason: a
     * component package's own testbench-driven test suite runs with
     * `base_path()` pointed at the Testbench skeleton, not the package's real
     * composer root, so only the Composer runtime sees the true root package.
     */
    public static function fromApplication(): self
    {
        $installedVersionsFile = new ReflectionClass(InstalledVersions::class)->getFileName();
        $composerDir = is_string($installedVersionsFile) ? dirname($installedVersionsFile) : '';
        $installed = $composerDir !== '' ? self::decode($composerDir.'/installed.json') : [];

        $rootInstallPath = realpath(InstalledVersions::getRootPackage()['install_path']) ?: null;

        return new self(
            installed: is_array($installed['packages'] ?? null)
                ? array_values(array_filter($installed['packages'], is_array(...)))
                : [],
            rootComposer: $rootInstallPath !== null ? self::decode($rootInstallPath.'/composer.json') : [],
            composerDir: $composerDir,
            rootDir: $rootInstallPath ?? '',
        );
    }

    /**
     * A copy with a different root package — the fixture hook tests use to
     * exercise app-origin discovery without a real composer.json, while
     * keeping the real built-in sources.
     *
     * @param  array<string, mixed>  $rootComposer
     */
    public function withRoot(array $rootComposer, string $rootDir): self
    {
        return new self($this->installed, $rootComposer, $this->composerDir, $rootDir);
    }

    /** @return list<WireSource> */
    public function discover(): array
    {
        $sources = [];

        foreach ($this->installed as $package) {
            $source = $this->sourceFromPackage($package, isRoot: false);

            if ($source instanceof WireSource) {
                $sources[] = $source;
            }
        }

        $root = $this->sourceFromPackage($this->rootComposer, isRoot: true);

        if ($root instanceof WireSource) {
            $sources[] = $root;
        }

        return $sources;
    }

    /** @return list<string> */
    public function builtinDirs(): array
    {
        $dirs = [];

        foreach ($this->discover() as $source) {
            if (! $source->isRoot) {
                $dirs = [...$dirs, ...$source->dirs];
            }
        }

        return $dirs;
    }

    /** @return list<string> */
    public function appDirs(): array
    {
        foreach ($this->discover() as $source) {
            if ($source->isRoot) {
                return $source->dirs;
            }
        }

        return [];
    }

    public function originOf(string $classFilePath): ?WireSource
    {
        $best = null;
        $bestLength = -1;

        foreach ($this->discover() as $source) {
            foreach ($source->dirs as $dir) {
                if (str_starts_with($classFilePath, $dir) && strlen($dir) > $bestLength) {
                    $best = $source;
                    $bestLength = strlen($dir);
                }
            }
        }

        return $best;
    }

    /**
     * @param  array<string, mixed>  $package
     */
    private function sourceFromPackage(array $package, bool $isRoot): ?WireSource
    {
        $name = $package['name'] ?? null;
        $lattice = $package['extra']['lattice'] ?? null;

        if (! is_string($name) || $name === '' || ! is_array($lattice)) {
            return null;
        }

        $discover = is_array($lattice['discover'] ?? null) ? $lattice['discover'] : [];

        if ($discover === []) {
            return null;
        }

        $installPath = is_string($package['install-path'] ?? null) ? $package['install-path'] : '../'.$name;
        $rawPackageDir = $isRoot ? $this->rootDir : $this->composerDir.'/'.$installPath;
        $packageDir = realpath($rawPackageDir) ?: $rawPackageDir;

        $dirs = [];

        foreach ($discover as $relative) {
            if (! is_string($relative)) {
                continue;
            }

            $rawDir = $packageDir.'/'.$relative;
            $dirs[] = realpath($rawDir) ?: $rawDir;
        }

        if ($dirs === []) {
            return null;
        }

        return new WireSource(
            composerName: $name,
            shortName: str_contains($name, '/') ? substr($name, strrpos($name, '/') + 1) : $name,
            packageDir: $packageDir,
            dirs: $dirs,
            isRoot: $isRoot,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function decode(string $path): array
    {
        if (! is_file($path)) {
            return [];
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return is_array($decoded) ? $decoded : [];
    }
}
