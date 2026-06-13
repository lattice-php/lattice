<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Core\Services\DefinitionDiscovery;

final class DiscoverCacheCommand extends Command
{
    protected $signature = 'lattice:discover-cache';

    protected $description = 'Cache discovered Lattice definitions for the configured discover paths';

    public function handle(DefinitionDiscovery $discovery): int
    {
        $paths = array_keys(DefinitionDiscovery::configuredPaths());

        foreach ($paths as $path) {
            $discovery->cache($path);
        }

        $this->components->info(sprintf('Cached definition discovery for %d path(s).', count($paths)));

        return self::SUCCESS;
    }
}
