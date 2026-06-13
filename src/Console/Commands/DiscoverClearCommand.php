<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

final class DiscoverClearCommand extends Command
{
    protected $signature = 'lattice:discover-clear';

    protected $description = 'Clear the cached Lattice definition discovery';

    public function handle(DiscoveryManifest $manifest): int
    {
        $manifest->clear();

        $this->components->info('Cleared the Lattice discovery manifest.');

        return self::SUCCESS;
    }
}
