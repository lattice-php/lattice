<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands\Concerns;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

trait GeneratesComponentPair
{
    protected function typeFromName(string $name, string $prefix): string
    {
        return $prefix.Str::kebab($name);
    }

    /**
     * Resolve where to scaffold the pair — the app by default, or a Composer
     * package when `--package=<dir>` is passed. In package mode the PHP
     * namespace comes from the package's composer.json psr-4 map, files land in
     * the package's own `src/` and `resources/js/`, and registration targets its
     * `plugin.ts` (created if absent) instead of the app's `registry.ts`.
     *
     * @return array{php: string, namespace: string, tsx: string, plugin: string, import: string, refresh: bool}
     */
    protected function scaffoldTarget(
        string $name,
        string $kebab,
        string $phpSubdir,
        string $tsxSubdir,
        string $appNamespace,
    ): array {
        $package = $this->option('package');

        if (! is_string($package) || trim($package) === '') {
            return [
                'php' => app_path($phpSubdir.'/'.$name.'.php'),
                'namespace' => $appNamespace,
                'tsx' => resource_path('js/'.$tsxSubdir.'/'.$kebab.'.tsx'),
                'plugin' => resource_path('js/registry.ts'),
                'import' => './'.$tsxSubdir.'/'.$kebab,
                'refresh' => true,
            ];
        }

        $dir = rtrim(trim($package), '/');
        $plugin = $dir.'/resources/js/plugin.ts';
        $this->ensurePluginFile($plugin, $dir);

        return [
            'php' => $dir.'/src/'.$phpSubdir.'/'.$name.'.php',
            'namespace' => $this->packageNamespace($dir).'\\'.str_replace('/', '\\', $phpSubdir),
            'tsx' => $dir.'/resources/js/'.$kebab.'.tsx',
            'plugin' => $plugin,
            'import' => './'.$kebab,
            'refresh' => false,
        ];
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
            'import { createPlugin } from "@lattice-php/lattice";'."\n\n"
            .'export default createPlugin({'."\n"
            .'  name: "'.$name.'",'."\n"
            .'  components: {},'."\n"
            .'});'."\n",
        );
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
        $packageImportPattern = '/^(import\s*\{[^}]*\}\s*from\s*"@lattice-php\/lattice"\s*;)/m';

        if (! preg_match($packageImportPattern, $contents, $matches)) {
            return $contents;
        }

        $importStatement = $matches[1];

        if (str_contains($importStatement, $helperName)) {
            return $contents;
        }

        $updated = preg_replace(
            '/^(import\s*\{)([^}]*)(\}\s*from\s*"@lattice-php\/lattice"\s*;)/m',
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

        $packageImportPattern = '/^(import\s*\{[^}]*\}\s*from\s*"@lattice-php\/lattice"\s*;)/m';

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

        // [^}]* assumes entry values contain no `}` — true for eagerComponent(X) and bare identifiers
        return preg_replace_callback(
            '/('.preg_quote($blockKey, '/').':\s*\{)([^}]*)(\})/s',
            function (array $matches) use ($entry): string {
                $existingBody = trim($matches[2]);
                $lines = $existingBody !== ''
                    ? $existingBody."\n    ".$entry
                    : $entry;

                return $matches[1]."\n    ".$lines."\n  ".$matches[3];
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
