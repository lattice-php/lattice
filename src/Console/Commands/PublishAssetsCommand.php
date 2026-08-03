<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Lattice\Lattice\Core\Discovery\ComponentPackages;

final class PublishAssetsCommand extends Command
{
    protected $signature = 'lattice:assets';

    protected $description = 'Publish the prebuilt Lattice standalone assets into the public directory';

    public function handle(Filesystem $files): int
    {
        $source = config('lattice.frontend.dist_path') ?? dirname(__DIR__, 3).'/dist-standalone';

        if (! $files->exists($source.'/manifest.json')) {
            $this->components->error("No standalone build found at [{$source}]. The installed package release should include it.");

            return self::FAILURE;
        }

        $path = trim((string) config('lattice.frontend.path'));

        if ($path === '' || $this->hasUnsafeSegment($path)) {
            $this->components->error('The [lattice.frontend.path] config value must be a non-empty relative subdirectory of the public path.');

            return self::FAILURE;
        }

        $target = public_path($path);
        $plugins = [];

        foreach (ComponentPackages::packages() as $package) {
            if ($package['standalone'] === null) {
                continue;
            }

            if (! $files->isFile($package['standalone'])) {
                $this->components->error("Standalone plugin for package [{$package['name']}] was not found at [{$package['standalone']}].");

                return self::FAILURE;
            }

            $plugins[] = ['name' => $package['name'], 'path' => $package['standalone']];
        }

        $files->deleteDirectory($target);
        $files->copyDirectory($source, $target);

        $manifest = json_decode($files->get($target.'/manifest.json'), true, flags: JSON_THROW_ON_ERROR);
        $manifest['plugins'] = [];
        $manifest['files'] ??= [];

        foreach ($plugins as $plugin) {
            $relative = 'plugins/'.$plugin['name'].'.js';
            $destination = $target.'/'.$relative;

            $files->ensureDirectoryExists(dirname($destination));
            $files->copy($plugin['path'], $destination);

            $manifest['plugins'][] = $relative;
            $manifest['files'][$relative] = substr((string) hash_file('sha256', $destination), 0, 12);
        }

        $files->put(
            $target.'/manifest.json',
            json_encode($manifest, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL,
        );

        $this->components->info(sprintf('Published Lattice standalone assets %s to [%s].', $manifest['version'], $target));

        return self::SUCCESS;
    }

    private function hasUnsafeSegment(string $path): bool
    {
        return array_any(explode('/', $path), fn ($segment): bool => in_array($segment, ['', '.', '..'], true));
    }
}
