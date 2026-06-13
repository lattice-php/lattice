<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

final class DiscoverCacheCommand extends Command
{
    protected $signature = 'lattice:discover-cache';

    protected $description = 'Cache discovered Lattice definitions for the configured discover paths';

    public function handle(DiscoveryManifest $manifest): int
    {
        $manifest->cache();

        $this->components->info('Cached the Lattice discovery manifest.');

        return self::SUCCESS;
    }
}
