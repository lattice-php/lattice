<?php
declare(strict_types=1);

namespace Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Support\Packages\LatticePackageManager;
use Lattice\Support\Packages\LatticePackageManagerException;

final class InstallCommand extends Command
{
    protected $signature = 'lattice:install';

    protected $description = 'Install the frontend packages or standalone assets for the installed Lattice packages';

    public function handle(LatticePackageManager $packages): int
    {
        try {
            $plan = $packages->installPlan();
        } catch (LatticePackageManagerException $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        if (! $plan->npmEnabled) {
            if ($plan->publishAssets && $this->call('lattice:assets') !== self::SUCCESS) {
                return self::FAILURE;
            }

            if (! $plan->publishAssets) {
                $this->components->info('The Lattice standalone assets are already current.');
            }

            return self::SUCCESS;
        }

        try {
            foreach ($plan->npmCommands as $command) {
                $this->components->task('Installing Lattice npm packages', fn () => $packages->run($command));
            }
        } catch (LatticePackageManagerException $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->components->info($plan->npmCommands === []
            ? 'The Lattice frontend packages are already installed.'
            : 'Installed the Lattice frontend packages.');

        $steps = $packages->missingFrontendSteps();

        if ($steps === []) {
            $this->components->info('The Lattice frontend wiring is already in place.');

            return self::SUCCESS;
        }

        $this->components->warn('Complete the frontend wiring:');
        $this->components->bulletList($steps);
        $this->line('  See https://latticephp.com/introduction/installation/');

        return self::SUCCESS;
    }
}
