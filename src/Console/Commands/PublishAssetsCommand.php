<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;

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

        $target = public_path(config('lattice.frontend.path'));

        $files->deleteDirectory($target);
        $files->copyDirectory($source, $target);

        $manifest = json_decode($files->get($target.'/manifest.json'), true, flags: JSON_THROW_ON_ERROR);

        $this->components->info(sprintf('Published Lattice standalone assets %s to [%s].', $manifest['version'], $target));

        return self::SUCCESS;
    }
}
