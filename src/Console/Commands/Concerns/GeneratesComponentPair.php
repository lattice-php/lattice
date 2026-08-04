<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands\Concerns;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

trait GeneratesComponentPair
{
    use ResolvesScaffoldTarget;

    protected function typeFromName(string $name, string $prefix): string
    {
        return $prefix.Str::kebab($name);
    }

    /**
     * Resolve where to scaffold the pair — the app by default, or a Composer
     * package when `--package=<dir>` is passed. In app mode the PHP class
     * follows the same App\Ui default (and separator escape hatch) as the
     * definition generators; the React file and registry entry are keyed by the
     * resolved class name. In package mode the PHP namespace comes from the
     * package's composer.json psr-4 map, files land in the package's own `src/`
     * and `resources/js/`, and registration targets its `plugin.ts` (created if
     * absent) instead of the app's `registry.ts`.
     *
     * @return array{class: string, kebab: string, php: string, namespace: string, tsx: string, plugin: string, import: string, refresh: bool}
     */
    protected function scaffoldTarget(
        string $name,
        string $phpSubdir,
        string $tsxSubdir,
    ): array {
        $package = $this->option('package');

        if (! is_string($package) || trim($package) === '') {
            $app = $this->resolveAppTarget($name, $phpSubdir);
            $kebab = Str::kebab($app['class']);

            return [
                'class' => $app['class'],
                'kebab' => $kebab,
                'php' => $app['path'],
                'namespace' => $app['namespace'],
                'tsx' => resource_path('js/'.$tsxSubdir.'/'.$kebab.'.tsx'),
                'plugin' => resource_path('js/registry.ts'),
                'import' => './'.$tsxSubdir.'/'.$kebab,
                'refresh' => true,
            ];
        }

        $kebab = Str::kebab($name);
        $dir = rtrim(trim($package), '/');
        $this->ensurePackageComposer($dir);
        $plugin = $dir.'/resources/js/plugin.ts';
        $this->ensurePluginFile($plugin, $dir);

        return [
            'class' => $name,
            'kebab' => $kebab,
            'php' => $dir.'/src/'.$phpSubdir.'/'.$name.'.php',
            'namespace' => $this->packageNamespace($dir).'\\'.str_replace('/', '\\', $phpSubdir),
            'tsx' => $dir.'/resources/js/'.$kebab.'.tsx',
            'plugin' => $plugin,
            'import' => './'.$kebab,
            'refresh' => false,
        ];
    }

    /**
     * Scaffold a Composer package on first use: when the target dir has no
     * composer.json, derive a vendor/name and PSR-4 namespace from its basename
     * (`acme-signature` → `acme/signature`, `Acme\Signature\`) and write a
     * skeleton already wired with the `extra.lattice` entry points.
     */
    private function ensurePackageComposer(string $packageDir): void
    {
        $composerPath = $packageDir.'/composer.json';

        if (File::exists($composerPath)) {
            return;
        }

        $slug = Str::kebab(basename($packageDir));
        [$vendor, $package] = str_contains($slug, '-')
            ? explode('-', $slug, 2)
            : [$slug, $slug];
        $namespace = Str::studly($vendor).'\\'.Str::studly($package);

        File::ensureDirectoryExists($packageDir);
        File::put($composerPath, json_encode([
            'name' => $vendor.'/'.$package,
            'type' => 'library',
            'autoload' => ['psr-4' => [$namespace.'\\' => 'src/']],
            'extra' => ['lattice' => ['plugin' => 'resources/js/plugin.ts', 'discover' => ['src']]],
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);

        $this->components->info('Scaffolded package: '.$composerPath);
    }

    private function packageNamespace(string $packageDir): string
    {
        $composer = json_decode(File::get($packageDir.'/composer.json'), true);
        $psr4 = is_array($composer['autoload']['psr-4'] ?? null) ? $composer['autoload']['psr-4'] : [];

        foreach ($psr4 as $namespace => $path) {
            if (is_string($path) && rtrim($path, '/') === 'src') {
                return rtrim((string) $namespace, '\\');
            }
        }

        $first = array_key_first($psr4);

        return is_string($first) ? rtrim($first, '\\') : 'App';
    }

    private function ensurePluginFile(string $pluginPath, string $packageDir): void
    {
        if (File::exists($pluginPath)) {
            return;
        }

        $composer = json_decode(File::get($packageDir.'/composer.json'), true);
        $name = is_string($composer['name'] ?? null) ? $composer['name'] : basename($packageDir);

        File::ensureDirectoryExists(dirname($pluginPath));
        File::put(
            $pluginPath,
            'import { type Plugin } from "@lattice-php/lattice/runtime";'."\n\n"
            .'export default {'."\n"
            .'  name: "'.$name.'",'."\n"
            .'  components: {},'."\n"
            .'  extensions: {'."\n"
            .'    "table.columns": {},'."\n"
            .'  },'."\n"
            .'} satisfies Plugin;'."\n",
        );
    }

    /**
     * @param  array{class: string, kebab: string, php: string, namespace: string, tsx: string, plugin: string, import: string, refresh: bool}  $target
     */
    protected function writePair(
        string $label,
        array $target,
        string $stub,
        string $phpType,
        string $tsxType,
        string $registryType,
        string $suffix,
        string $blockKey = 'components',
        ?string $entryWrapper = 'eagerComponent',
    ): int {
        $class = $target['class'];
        $force = (bool) $this->option('force');

        $this->writeStub(
            $stub.'.php.stub',
            $target['php'],
            ['namespace' => $target['namespace'], 'class' => $class, 'type' => $phpType], force: $force);

        $this->writeStub(
            $stub.'.tsx.stub',
            $target['tsx'],
            ['class' => $class, 'type' => $tsxType], force: $force);

        $this->registerInPlugin($target['plugin'], $registryType, $class.$suffix, $target['import'], $blockKey, $entryWrapper);

        if ($target['refresh']) {
            $this->refreshTypes();
        }

        $this->components->info("$label [$class] created with type [$registryType].");

        return self::SUCCESS;
    }

    /**
     * @param  array<string, string>  $replacements
     */
    protected function writeStub(string $stub, string $targetPath, array $replacements, bool $force = false): void
    {
        $stubPath = __DIR__.'/../../stubs/'.$stub;
        $contents = strtr(File::get($stubPath), $this->placeholders($replacements));

        if (File::exists($targetPath) && ! $force) {
            $this->components->warn('File already exists, skipping (use --force to overwrite): '.$targetPath);

            return;
        }

        File::ensureDirectoryExists(dirname($targetPath));
        File::put($targetPath, $contents);
        $this->components->info('Created: '.$targetPath);
    }

    protected function registerInPlugin(
        string $pluginPath,
        string $type,
        string $componentName,
        string $importPath,
        string $blockKey = 'components',
        ?string $entryWrapper = 'eagerComponent',
    ): void {
        if (! File::exists($pluginPath)) {
            $filename = basename($pluginPath);
            $this->components->error($filename.' not found at '.$pluginPath.'. Run `php artisan vendor:publish --tag=lattice-js` first.');

            return;
        }

        $contents = File::get($pluginPath);

        if ($entryWrapper !== null) {
            $contents = $this->ensureEagerComponentImport($contents, $entryWrapper);
        }

        $contents = $this->ensureComponentImport($contents, $componentName, $importPath);
        $contents = $this->ensureComponentEntry($contents, $type, $componentName, $blockKey, $entryWrapper);

        File::put($pluginPath, $contents);
    }

    protected function refreshTypes(): void
    {
        try {
            $this->call('lattice:typescript');
        } catch (\Throwable $e) {
            $this->components->warn('Could not refresh TypeScript types: '.$e->getMessage());
        }
    }

    private function ensureEagerComponentImport(string $contents, string $helperName = 'eagerComponent'): string
    {
        $packageImportPattern = '/^(import\s*\{[^}]*\}\s*from\s*"@lattice-php\/lattice(?:\/runtime)?"\s*;)/m';

        if (! preg_match($packageImportPattern, $contents, $matches)) {
            return $contents;
        }

        $importStatement = $matches[1];

        if (str_contains($importStatement, $helperName)) {
            return $contents;
        }

        $updated = preg_replace(
            '/^(import\s*\{)([^}]*)(\}\s*from\s*"@lattice-php\/lattice(?:\/runtime)?"\s*;)/m',
            '$1$2, '.$helperName.'$3',
            $contents,
            1,
        );

        return $updated ?? $contents;
    }

    private function ensureComponentImport(string $contents, string $componentName, string $importPath): string
    {
        $importLine = 'import { '.$componentName.' } from "'.$importPath.'";';

        if (str_contains($contents, $importLine)) {
            return $contents;
        }

        $packageImportPattern = '/^(import\s*\{[^}]*\}\s*from\s*"@lattice-php\/lattice(?:\/runtime)?"\s*;)/m';

        return preg_replace(
            $packageImportPattern,
            '$1'."\n".$importLine,
            $contents,
            1,
        ) ?? $contents;
    }

    private function ensureComponentEntry(
        string $contents,
        string $type,
        string $componentName,
        string $blockKey = 'components',
        ?string $entryWrapper = 'eagerComponent',
    ): string {
        $value = $entryWrapper !== null
            ? $entryWrapper.'('.$componentName.')'
            : $componentName;

        $entry = '"'.$type.'": '.$value.',';

        if (str_contains($contents, '"'.$type.'":')) {
            return $contents;
        }

        return preg_replace_callback(
            '/^([ \t]*)('.preg_quote($blockKey, '/').':\s*\{)([^}]*)(\})/m',
            function (array $matches) use ($entry): string {
                $existingBody = trim($matches[3]);
                $entryIndent = $matches[1].'  ';
                $lines = $existingBody !== ''
                    ? $existingBody."\n".$entryIndent.$entry
                    : $entry;

                return $matches[1].$matches[2]."\n".$entryIndent.$lines."\n".$matches[1].$matches[4];
            },
            $contents,
            1,
        ) ?? $contents;
    }

    /**
     * @param  array<string, string>  $replacements
     * @return array<string, string>
     */
    private function placeholders(array $replacements): array
    {
        $result = [];
        foreach ($replacements as $key => $value) {
            $result['{{ '.$key.' }}'] = $value;
        }

        return $result;
    }
}
