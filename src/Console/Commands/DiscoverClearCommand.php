<?php

declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Core\Services\DefinitionDiscovery;

final class DiscoverClearCommand extends Command
{
    protected $signature = 'lattice:discover-clear';

    protected $description = 'Clear the cached Lattice definition discovery';

    public function handle(DefinitionDiscovery $discovery): int
    {
        $paths = array_keys(DefinitionDiscovery::configuredPaths());

        foreach ($paths as $path) {
            $discovery->forget($path);
        }

        $this->components->info(sprintf('Cleared definition discovery cache for %d path(s).', count($paths)));

        return self::SUCCESS;
    }
}
