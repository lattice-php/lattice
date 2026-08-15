<?php
declare(strict_types=1);

use Illuminate\Filesystem\Filesystem;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Composer;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Symfony\Component\Console\Output\OutputInterface;

use function Pest\Laravel\artisan;

beforeEach(function (): void {
    $this->originalBasePath = base_path();
    $this->projectPath = sys_get_temp_dir().'/lattice-package-command-'.uniqid();

    File::ensureDirectoryExists($this->projectPath.'/resources/css');
    File::ensureDirectoryExists($this->projectPath.'/resources/js');
    File::put($this->projectPath.'/composer.json', json_encode([
        'require' => [
            'lattice-php/lattice' => '^0.52',
        ],
        'require-dev' => [
            'lattice-php/media' => '^0.52',
        ],
    ], JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
    File::put($this->projectPath.'/package.json', json_encode([
        'dependencies' => [
            '@lattice-php/lattice' => '^0.52.0',
        ],
    ], JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));

    app()->setBasePath($this->projectPath);
    $this->composer = new RecordingComposer(app(Filesystem::class), $this->projectPath);
    app()->instance(Composer::class, $this->composer);
});

afterEach(function (): void {
    app()->setBasePath($this->originalBasePath);
    File::deleteDirectory($this->projectPath);
});

it('reports when every installed Lattice package is current', function (): void {
    Process::fake(fn (PendingProcess $process) => match ($process->command) {
        ['composer', 'show', '--format=json', 'lattice-php/*'] => Process::result(output: composerPackages('0.53.0')),
        ['composer', 'show', '--all', '--format=json', 'lattice-php/lattice'] => Process::result(output: composerReleases('0.53.0')),
        ['npm', 'view', '@lattice-php/core@0.53.0', 'version', '--json'],
        ['npm', 'view', '@lattice-php/lattice@0.53.0', 'version', '--json'] => Process::result(output: '"0.53.0"'),
        ['npm', 'view', '@lattice-php/media@0.53.0', 'version', '--json'] => Process::result(errorOutput: 'npm error code E404', exitCode: 1),
        ['npm', 'ls', '--all', '--json', '@lattice-php/core', '@lattice-php/lattice'] => Process::result(output: npmPackages('0.53.0')),
        default => Process::result(errorOutput: 'Unexpected process: '.json_encode($process->command), exitCode: 1),
    });
    Process::preventStrayProcesses();

    artisan('lattice:update')
        ->expectsOutputToContain('Lattice is already up to date.')
        ->assertSuccessful();

    Process::assertNotRan(fn (PendingProcess $process): bool => in_array($process->command[1] ?? null, ['require', 'install'], true));
});

it('updates Composer packages and their published npm counterparts', function (): void {
    Process::fake(fn (PendingProcess $process) => match ($process->command) {
        ['composer', 'show', '--format=json', 'lattice-php/*'] => Process::result(output: composerPackages('0.52.1')),
        ['composer', 'show', '--all', '--format=json', 'lattice-php/lattice'] => Process::result(output: composerReleases('0.53.0', '0.52.1')),
        ['npm', 'view', '@lattice-php/core@0.53.0', 'version', '--json'],
        ['npm', 'view', '@lattice-php/lattice@0.53.0', 'version', '--json'] => Process::result(output: '"0.53.0"'),
        ['npm', 'view', '@lattice-php/media@0.53.0', 'version', '--json'] => Process::result(errorOutput: 'npm error code E404', exitCode: 1),
        ['npm', 'ls', '--all', '--json', '@lattice-php/core', '@lattice-php/lattice'] => Process::result(output: npmPackages('0.52.1')),
        ['npm', 'install', '--save-prod', '@lattice-php/lattice@^0.53.0'] => Process::result(),
        default => Process::result(errorOutput: 'Unexpected process: '.json_encode($process->command), exitCode: 1),
    });
    Process::preventStrayProcesses();

    artisan('lattice:update')
        ->expectsOutputToContain('Updated Lattice packages to 0.53.0.')
        ->assertSuccessful();

    expect($this->composer->requirements)->toBe([[
        'packages' => [
            'lattice-php/lattice:^0.53',
            '--with-all-dependencies',
            '--no-interaction',
        ],
        'dev' => false,
    ], [
        'packages' => [
            'lattice-php/media:^0.53',
            '--with-all-dependencies',
            '--no-interaction',
        ],
        'dev' => true,
    ]]);
    Process::assertRan(fn (PendingProcess $process): bool => $process->command === [
        'npm',
        'install',
        '--save-prod',
        '@lattice-php/lattice@^0.53.0',
    ]);
});

it('installs a missing npm counterpart without updating Composer', function (): void {
    File::put($this->projectPath.'/package.json', json_encode(['dependencies' => []], JSON_THROW_ON_ERROR));

    Process::fake(fn (PendingProcess $process) => match ($process->command) {
        ['composer', 'show', '--format=json', 'lattice-php/*'] => Process::result(output: composerPackages('0.52.1')),
        ['npm', 'view', '@lattice-php/core@0.52.1', 'version', '--json'],
        ['npm', 'view', '@lattice-php/lattice@0.52.1', 'version', '--json'] => Process::result(output: '"0.52.1"'),
        ['npm', 'view', '@lattice-php/media@0.52.1', 'version', '--json'] => Process::result(errorOutput: 'npm error code E404', exitCode: 1),
        ['npm', 'ls', '--all', '--json', '@lattice-php/core', '@lattice-php/lattice'] => Process::result(output: npmPackages()),
        ['npm', 'install', '--save-prod', '@lattice-php/lattice@^0.52.0'] => Process::result(),
        default => Process::result(errorOutput: 'Unexpected process: '.json_encode($process->command), exitCode: 1),
    });
    Process::preventStrayProcesses();

    artisan('lattice:install')
        ->expectsOutputToContain('Installed the Lattice frontend packages.')
        ->expectsOutputToContain('Complete the frontend wiring')
        ->assertSuccessful();

    Process::assertNotRan(fn (PendingProcess $process): bool => ($process->command[0] ?? null) === 'composer' && ($process->command[1] ?? null) === 'require');
});

it('shows update work without changing packages during a dry run', function (): void {
    Process::fake(fn (PendingProcess $process) => match ($process->command) {
        ['composer', 'show', '--format=json', 'lattice-php/*'] => Process::result(output: composerPackages('0.52.1')),
        ['composer', 'show', '--all', '--format=json', 'lattice-php/lattice'] => Process::result(output: composerReleases('0.53.0', '0.52.1')),
        ['npm', 'view', '@lattice-php/core@0.53.0', 'version', '--json'],
        ['npm', 'view', '@lattice-php/lattice@0.53.0', 'version', '--json'] => Process::result(output: '"0.53.0"'),
        ['npm', 'view', '@lattice-php/media@0.53.0', 'version', '--json'] => Process::result(errorOutput: 'npm error code E404', exitCode: 1),
        ['npm', 'ls', '--all', '--json', '@lattice-php/core', '@lattice-php/lattice'] => Process::result(output: npmPackages('0.52.1')),
        default => Process::result(errorOutput: 'Unexpected process: '.json_encode($process->command), exitCode: 1),
    });
    Process::preventStrayProcesses();

    artisan('lattice:update', ['--dry-run' => true])
        ->expectsOutputToContain('Dry run complete. No files were changed.')
        ->expectsOutputToContain('composer require lattice-php/lattice:^0.53')
        ->expectsOutputToContain('composer require lattice-php/media:^0.53 --with-all-dependencies --no-interaction --dev')
        ->expectsOutputToContain('npm install --save-prod @lattice-php/lattice@^0.53.0')
        ->assertSuccessful();

    Process::assertNotRan(fn (PendingProcess $process): bool => in_array($process->command[1] ?? null, ['require', 'install'], true));
});

it('publishes standalone assets when installing without an npm project', function (): void {
    File::delete($this->projectPath.'/package.json');
    $distPath = $this->projectPath.'/vendor/lattice-assets';
    File::ensureDirectoryExists($distPath);
    File::put($distPath.'/manifest.json', json_encode([
        'version' => '0.52.1',
        'files' => [],
    ], JSON_THROW_ON_ERROR));
    File::put($distPath.'/lattice.js', 'export {};');
    config()->set('lattice.frontend.dist_path', $distPath);

    Process::fake([
        '*' => fn (PendingProcess $process) => match ($process->command) {
            ['composer', 'show', '--format=json', 'lattice-php/*'] => Process::result(output: composerPackages('0.52.1')),
            default => Process::result(errorOutput: 'Unexpected process: '.json_encode($process->command), exitCode: 1),
        },
    ]);
    Process::preventStrayProcesses();

    artisan('lattice:install')
        ->expectsOutputToContain('Published Lattice standalone assets 0.52.1')
        ->assertSuccessful();

    expect(json_decode(File::get($this->projectPath.'/public/vendor/lattice/manifest.json'), true)['version'])
        ->toBe('0.52.1');
    Process::assertNotRan(fn (PendingProcess $process): bool => ($process->command[0] ?? null) === 'npm');
});

it('stops before updating when an npm release does not match Composer', function (): void {
    Process::fake(fn (PendingProcess $process) => match ($process->command) {
        ['composer', 'show', '--format=json', 'lattice-php/*'] => Process::result(output: composerPackages('0.52.1')),
        ['composer', 'show', '--all', '--format=json', 'lattice-php/lattice'] => Process::result(output: composerReleases('0.53.0', '0.52.1')),
        ['npm', 'view', '@lattice-php/core@0.53.0', 'version', '--json'] => Process::result(output: '"0.53.0"'),
        ['npm', 'view', '@lattice-php/lattice@0.53.0', 'version', '--json'] => Process::result(output: '"0.52.1"'),
        default => Process::result(errorOutput: 'Unexpected process: '.json_encode($process->command), exitCode: 1),
    });
    Process::preventStrayProcesses();

    artisan('lattice:update')
        ->expectsOutputToContain('did not report the required release [0.53.0]')
        ->assertFailed();

    Process::assertNotRan(fn (PendingProcess $process): bool => in_array($process->command[1] ?? null, ['require', 'install'], true));
});

function composerPackages(string $version): string
{
    return json_encode([
        'installed' => [
            ['name' => 'lattice-php/core', 'direct-dependency' => false, 'version' => $version],
            ['name' => 'lattice-php/lattice', 'direct-dependency' => true, 'version' => $version],
            ['name' => 'lattice-php/media', 'direct-dependency' => true, 'version' => $version],
        ],
    ], JSON_THROW_ON_ERROR);
}

function composerReleases(string ...$versions): string
{
    return json_encode(['versions' => $versions], JSON_THROW_ON_ERROR);
}

function npmPackages(?string $version = null): string
{
    $dependencies = [];

    if ($version !== null) {
        $dependencies['@lattice-php/lattice'] = [
            'version' => $version,
            'dependencies' => [
                '@lattice-php/core' => ['version' => $version],
            ],
        ];
    }

    return json_encode(['dependencies' => $dependencies], JSON_THROW_ON_ERROR);
}

final class RecordingComposer extends Composer
{
    /** @var list<array{packages: list<string>, dev: bool}> */
    public array $requirements = [];

    public bool $successful = true;

    #[Override]
    public function requirePackages(
        array $packages,
        bool $dev = false,
        Closure|OutputInterface|null $output = null,
        $composerBinary = null,
    ): bool {
        $this->requirements[] = [
            'packages' => array_values($packages),
            'dev' => $dev,
        ];

        return $this->successful;
    }
}
