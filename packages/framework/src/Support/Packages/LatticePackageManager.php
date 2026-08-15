<?php
declare(strict_types=1);

namespace Lattice\Support\Packages;

use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Composer;
use Illuminate\Support\Facades\Process;
use JsonException;
use Throwable;

final readonly class LatticePackageManager
{
    public function __construct(
        private Composer $composer,
        private ?string $basePath = null,
    ) {}

    public function installPlan(): LatticePackagePlan
    {
        $composerPackages = $this->installedComposerPackages();
        $targetVersion = $this->mainPackageVersion($composerPackages);

        if (! is_file($this->path('package.json'))) {
            return new LatticePackagePlan(
                targetVersion: $targetVersion,
                packages: $this->statesWithoutNpm($composerPackages, $targetVersion),
                composerCommands: [],
                npmCommands: [],
                npmEnabled: false,
                publishAssets: ! $this->publishedAssetsAreCurrent($targetVersion),
            );
        }

        $states = $this->packageStates(
            $composerPackages,
            static fn (array $package): string => $package['version'],
        );

        return new LatticePackagePlan(
            targetVersion: $targetVersion,
            packages: $states,
            composerCommands: [],
            npmCommands: $this->npmCommands($states),
            npmEnabled: true,
            publishAssets: false,
        );
    }

    public function updatePlan(): LatticePackagePlan
    {
        $composerPackages = $this->installedComposerPackages();
        $targetVersion = $this->latestStableVersion();

        if (! is_file($this->path('package.json'))) {
            $states = $this->statesWithoutNpm($composerPackages, $targetVersion);

            return new LatticePackagePlan(
                targetVersion: $targetVersion,
                packages: $states,
                composerCommands: $this->composerCommands($states),
                npmCommands: [],
                npmEnabled: false,
                publishAssets: ! $this->publishedAssetsAreCurrent($targetVersion),
            );
        }

        $states = $this->packageStates(
            $composerPackages,
            static fn (): string => $targetVersion,
        );

        return new LatticePackagePlan(
            targetVersion: $targetVersion,
            packages: $states,
            composerCommands: $this->composerCommands($states),
            npmCommands: $this->npmCommands($states),
            npmEnabled: true,
            publishAssets: false,
        );
    }

    /** @param list<string> $command */
    public function runComposer(array $command): void
    {
        if (array_slice($command, 0, 2) !== ['composer', 'require']) {
            throw new LatticePackageManagerException('Only Composer require commands can be executed.');
        }

        $arguments = array_slice($command, 2);
        $dev = in_array('--dev', $arguments, true);
        $arguments = array_values(array_filter($arguments, static fn (string $argument): bool => $argument !== '--dev'));
        $output = '';

        $successful = $this->composer()
            ->requirePackages(
                $arguments,
                $dev,
                static function (string $type, string $line) use (&$output): void {
                    $output .= $line;
                },
            );

        if (! $successful) {
            $message = 'Process ['.implode(' ', $command).'] failed.';
            $details = trim($output);

            throw new LatticePackageManagerException($details === '' ? $message : $message.' '.$details);
        }
    }

    /** @param list<string> $command */
    public function runNpm(array $command): void
    {
        $result = $this->invoke($command, 600);

        if ($result->failed()) {
            throw new LatticePackageManagerException($this->failureMessage($command, $result));
        }
    }

    /** @return list<string> */
    public function missingFrontendSteps(): array
    {
        $steps = [];
        $viteFiles = glob($this->path('vite.config.*')) ?: [];
        $cssFiles = glob($this->path('resources/css/*.css')) ?: [];
        $entryFiles = glob($this->path('resources/js/app.*')) ?: [];

        if (! $this->filesContain($viteFiles, '@lattice-php/lattice/vite')) {
            $steps[] = 'Add the lattice() plugin from [@lattice-php/lattice/vite] to your Vite configuration.';
        }

        if (! $this->filesContain($cssFiles, '@lattice-php/lattice/css')) {
            $steps[] = 'Import [@lattice-php/lattice/css] after Tailwind in your application stylesheet.';
        }

        if (! $this->filesContain($entryFiles, 'createLatticeApp') && ! $this->filesContain($entryFiles, 'createPageResolver')) {
            $steps[] = 'Boot the Inertia React application with createLatticeApp().';
        }

        return $steps;
    }

    /**
     * @return list<array{name: string, version: string, direct: bool, section: 'require'|'require-dev'|null}>
     */
    private function installedComposerPackages(): array
    {
        $manifest = $this->jsonFile($this->path('composer.json'));
        $result = $this->process($this->composerCommand(['show', '--format=json', 'lattice-php/*']));
        $data = $this->decodeObject($result->output(), 'Composer package list');
        $installed = $data['installed'] ?? null;

        if (! is_array($installed)) {
            throw new LatticePackageManagerException('Composer did not return an installed Lattice package list.');
        }

        $packages = [];

        foreach ($installed as $package) {
            if (! is_array($package) || ! is_string($package['name'] ?? null) || ! is_string($package['version'] ?? null)) {
                continue;
            }

            $name = $package['name'];

            if (! str_starts_with($name, 'lattice-php/')) {
                continue;
            }

            $version = $this->stableVersion($package['version']);

            if ($version === null) {
                throw new LatticePackageManagerException("Installed Lattice package [{$name}] does not use a stable semantic version.");
            }

            $section = match (true) {
                isset($manifest['require'][$name]) => 'require',
                isset($manifest['require-dev'][$name]) => 'require-dev',
                default => null,
            };

            $packages[] = [
                'name' => $name,
                'version' => $version,
                'direct' => $section !== null,
                'section' => $section,
            ];
        }

        usort($packages, static fn (array $left, array $right): int => $left['name'] <=> $right['name']);

        if ($packages === []) {
            throw new LatticePackageManagerException('No installed [lattice-php/*] Composer packages were found.');
        }

        return $packages;
    }

    private function latestStableVersion(): string
    {
        $result = $this->process($this->composerCommand(['show', '--all', '--format=json', 'lattice-php/lattice']));
        $data = $this->decodeObject($result->output(), 'Composer release list');
        $versions = $data['versions'] ?? null;

        if (! is_array($versions)) {
            throw new LatticePackageManagerException('Composer did not return available Lattice releases.');
        }

        $stable = [];

        foreach ($versions as $version) {
            if (! is_string($version)) {
                continue;
            }

            $normalized = $this->stableVersion($version);

            if ($normalized !== null) {
                $stable[] = $normalized;
            }
        }

        usort($stable, $this->compareVersions(...));

        $latest = array_pop($stable);

        if (! is_string($latest)) {
            throw new LatticePackageManagerException('No stable Lattice release was found.');
        }

        return $latest;
    }

    /**
     * @param  list<array{name: string, version: string, direct: bool, section: 'require'|'require-dev'|null}>  $composerPackages
     * @param  callable(array{name: string, version: string, direct: bool, section: 'require'|'require-dev'|null}): string  $targetVersion
     * @return list<LatticePackageState>
     */
    private function packageStates(array $composerPackages, callable $targetVersion): array
    {
        $published = [];

        foreach ($composerPackages as $package) {
            $npmName = $this->npmName($package['name']);
            $target = $targetVersion($package);

            if ($this->npmReleaseExists($npmName, $target)) {
                $published[$npmName] = $target;
            }
        }

        $installedNpm = $this->installedNpmVersions(array_keys($published));
        $npmSections = $this->npmSections();
        $states = [];

        foreach ($composerPackages as $package) {
            $npmName = $this->npmName($package['name']);

            $states[] = new LatticePackageState(
                composerName: $package['name'],
                npmName: $npmName,
                installedComposerVersion: $package['version'],
                targetVersion: $targetVersion($package),
                directComposerDependency: $package['direct'],
                composerSection: $package['section'],
                npmPublished: isset($published[$npmName]),
                installedNpmVersion: $installedNpm[$npmName] ?? null,
                npmSection: $npmSections[$npmName] ?? null,
            );
        }

        return $states;
    }

    /**
     * @param  list<array{name: string, version: string, direct: bool, section: 'require'|'require-dev'|null}>  $composerPackages
     * @return list<LatticePackageState>
     */
    private function statesWithoutNpm(array $composerPackages, string $targetVersion): array
    {
        return array_map(
            fn (array $package): LatticePackageState => new LatticePackageState(
                composerName: $package['name'],
                npmName: $this->npmName($package['name']),
                installedComposerVersion: $package['version'],
                targetVersion: $targetVersion,
                directComposerDependency: $package['direct'],
                composerSection: $package['section'],
                npmPublished: false,
                installedNpmVersion: null,
                npmSection: null,
            ),
            $composerPackages,
        );
    }

    /**
     * @param  list<array{name: string, version: string, direct: bool, section: 'require'|'require-dev'|null}>  $packages
     */
    private function mainPackageVersion(array $packages): string
    {
        foreach ($packages as $package) {
            if ($package['name'] === 'lattice-php/lattice') {
                return $package['version'];
            }
        }

        throw new LatticePackageManagerException('The [lattice-php/lattice] Composer package is not installed.');
    }

    private function npmReleaseExists(string $package, string $targetVersion): bool
    {
        $command = [
            'npm',
            'view',
            "{$package}@{$targetVersion}",
            'version',
            '--json',
        ];
        $result = $this->invoke($command, 60);

        if ($result->failed()) {
            if (str_contains($result->errorOutput(), 'E404')) {
                return false;
            }

            throw new LatticePackageManagerException($this->failureMessage($command, $result));
        }

        $data = $this->decode($result->output(), "npm release [{$package}]");
        $version = match (true) {
            is_string($data) => $data,
            is_array($data) && is_string($data[0] ?? null) => $data[0],
            default => null,
        };

        if ($version !== $targetVersion) {
            throw new LatticePackageManagerException("npm package [{$package}] did not report the required release [{$targetVersion}].");
        }

        return true;
    }

    /**
     * @param  list<string>  $packages
     * @return array<string, string>
     */
    private function installedNpmVersions(array $packages): array
    {
        if ($packages === []) {
            return [];
        }

        sort($packages);
        $command = ['npm', 'ls', '--all', '--json', ...$packages];
        $result = $this->invoke($command, 60);

        try {
            $data = $this->decodeObject($result->output(), 'installed npm package list');
        } catch (LatticePackageManagerException $exception) {
            if ($result->failed()) {
                throw new LatticePackageManagerException($this->failureMessage($command, $result), $exception->getCode(), previous: $exception);
            }

            throw $exception;
        }

        $versions = [];
        $dependencies = $data['dependencies'] ?? [];

        if (is_array($dependencies)) {
            $this->collectNpmVersions($dependencies, $versions);
        }

        return $versions;
    }

    /**
     * @param  array<array-key, mixed>  $dependencies
     * @param  array<string, string>  $versions
     */
    private function collectNpmVersions(array $dependencies, array &$versions): void
    {
        foreach ($dependencies as $name => $dependency) {
            if (! is_string($name) || ! is_array($dependency)) {
                continue;
            }

            if (str_starts_with($name, '@lattice-php/') && is_string($dependency['version'] ?? null)) {
                $versions[$name] ??= $dependency['version'];
            }

            if (is_array($dependency['dependencies'] ?? null)) {
                $this->collectNpmVersions($dependency['dependencies'], $versions);
            }
        }
    }

    /** @return array<string, 'dependencies'|'devDependencies'> */
    private function npmSections(): array
    {
        $manifest = $this->jsonFile($this->path('package.json'));
        $sections = [];

        foreach (['dependencies', 'devDependencies'] as $section) {
            if (! is_array($manifest[$section] ?? null)) {
                continue;
            }

            foreach ($manifest[$section] as $package => $constraint) {
                if (is_string($package) && str_starts_with($package, '@lattice-php/')) {
                    $sections[$package] = $section;
                }
            }
        }

        return $sections;
    }

    /**
     * @param  list<LatticePackageState>  $states
     * @return list<list<string>>
     */
    private function composerCommands(array $states): array
    {
        if (! array_any($states, static fn (LatticePackageState $state): bool => $state->composerNeedsUpdate())) {
            return [];
        }

        $groups = ['require' => [], 'require-dev' => []];

        foreach ($states as $state) {
            if (! $state->directComposerDependency || $state->composerSection === null) {
                continue;
            }

            $groups[$state->composerSection][] = $state->composerName.':'.$this->composerConstraint($state->targetVersion);
        }

        $commands = [];

        foreach ($groups as $section => $packages) {
            if ($packages === []) {
                continue;
            }

            $command = ['composer', 'require', ...$packages, '--with-all-dependencies', '--no-interaction'];

            if ($section === 'require-dev') {
                $command[] = '--dev';
            }

            $commands[] = $command;
        }

        return $commands;
    }

    /**
     * @param  list<LatticePackageState>  $states
     * @return list<list<string>>
     */
    private function npmCommands(array $states): array
    {
        $groups = ['dependencies' => [], 'devDependencies' => []];

        foreach ($states as $state) {
            if (! $state->npmNeedsUpdate() || (! $state->directComposerDependency && $state->npmSection === null)) {
                continue;
            }

            $section = $state->npmSection ?? match ($state->composerSection) {
                'require-dev' => 'devDependencies',
                default => 'dependencies',
            };
            $groups[$section][] = $state->npmName.'@'.$this->npmConstraint($state->targetVersion);
        }

        $commands = [];

        foreach ($groups as $section => $packages) {
            if ($packages === []) {
                continue;
            }

            $commands[] = [
                'npm',
                'install',
                $section === 'devDependencies' ? '--save-dev' : '--save-prod',
                ...$packages,
            ];
        }

        return $commands;
    }

    private function composerConstraint(string $version): string
    {
        [$major, $minor] = array_map(intval(...), explode('.', $version));

        return $major === 0 ? "^0.{$minor}" : "^{$major}";
    }

    private function npmConstraint(string $version): string
    {
        [$major, $minor] = array_map(intval(...), explode('.', $version));

        return $major === 0 ? "^0.{$minor}.0" : "^{$major}.0.0";
    }

    private function stableVersion(string $version): ?string
    {
        return preg_match('/(?:^|\\s|\\*)v?(\\d+\\.\\d+\\.\\d+)(?:\\s|$)/', trim($version), $matches) === 1
            ? $matches[1]
            : null;
    }

    private function npmName(string $composerName): string
    {
        return '@lattice-php/'.substr($composerName, strlen('lattice-php/'));
    }

    private function compareVersions(string $left, string $right): int
    {
        return version_compare($left, $right);
    }

    /**
     * @param  list<string>  $arguments
     * @return list<string>
     */
    private function composerCommand(array $arguments): array
    {
        return array_values([...$this->composer()->findComposer(), ...$arguments]);
    }

    private function composer(): Composer
    {
        return $this->composer->setWorkingPath($this->path());
    }

    private function publishedAssetsAreCurrent(string $targetVersion): bool
    {
        $path = trim((string) config('lattice.frontend.path'));
        $manifest = public_path($path.'/manifest.json');

        if (! is_file($manifest)) {
            return false;
        }

        try {
            $data = $this->jsonFile($manifest);
        } catch (LatticePackageManagerException) {
            return false;
        }

        return ($data['version'] ?? null) === $targetVersion;
    }

    /** @param list<string> $files */
    private function filesContain(array $files, string $needle): bool
    {
        foreach ($files as $file) {
            $contents = file_get_contents($file);

            if (is_string($contents) && str_contains($contents, $needle)) {
                return true;
            }
        }

        return false;
    }

    /** @param list<string> $command */
    private function process(array $command): ProcessResult
    {
        $result = $this->invoke($command, 60);

        if ($result->failed()) {
            throw new LatticePackageManagerException($this->failureMessage($command, $result));
        }

        return $result;
    }

    /** @param list<string> $command */
    private function invoke(array $command, int $timeout): ProcessResult
    {
        try {
            return Process::path($this->path())->timeout($timeout)->run($command);
        } catch (Throwable $exception) {
            throw new LatticePackageManagerException('Process ['.implode(' ', $command).'] could not be started. '.$exception->getMessage(), $exception->getCode(), previous: $exception);
        }
    }

    /** @return array<string, mixed> */
    private function jsonFile(string $path): array
    {
        if (! is_file($path)) {
            throw new LatticePackageManagerException("Required manifest [{$path}] was not found.");
        }

        $contents = file_get_contents($path);

        if (! is_string($contents)) {
            throw new LatticePackageManagerException("Manifest [{$path}] could not be read.");
        }

        return $this->decodeObject($contents, "manifest [{$path}]");
    }

    /** @return array<string, mixed> */
    private function decodeObject(string $json, string $source): array
    {
        $data = $this->decode($json, $source);

        if (! is_array($data)) {
            throw new LatticePackageManagerException("Invalid JSON object returned for {$source}.");
        }

        return $data;
    }

    private function decode(string $json, string $source): mixed
    {
        try {
            return json_decode($json, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new LatticePackageManagerException("Invalid JSON returned for {$source}.", $exception->getCode(), previous: $exception);
        }
    }

    /** @param list<string> $command */
    private function failureMessage(array $command, ProcessResult $result): string
    {
        $details = trim($result->errorOutput()) ?: trim($result->output());
        $message = 'Process ['.implode(' ', $command).'] failed.';

        return $details === '' ? $message : $message.' '.$details;
    }

    private function path(string $path = ''): string
    {
        $basePath = $this->basePath ?? base_path();

        return $path === '' ? $basePath : $basePath.'/'.$path;
    }
}
