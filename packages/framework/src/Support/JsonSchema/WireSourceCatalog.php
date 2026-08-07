<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

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

    public static function fromApplication(): self
    {
        $composerDir = base_path('vendor/composer');
        $installed = self::decode($composerDir.'/installed.json');

        return new self(
            installed: is_array($installed['packages'] ?? null) ? $installed['packages'] : [],
            rootComposer: self::decode(base_path('composer.json')),
            composerDir: $composerDir,
            rootDir: base_path(),
        );
    }

    /** @return list<WireSource> */
    public function discover(): array
    {
        $sources = [];

        foreach ($this->installed as $package) {
            $source = is_array($package) ? $this->sourceFromPackage($package, isRoot: false) : null;

            if ($source !== null) {
                $sources[] = $source;
            }
        }

        $root = $this->sourceFromPackage($this->rootComposer, isRoot: true);

        if ($root !== null) {
            $sources[] = $root;
        }

        return $sources;
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
