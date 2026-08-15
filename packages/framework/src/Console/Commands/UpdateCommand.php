<?php
declare(strict_types=1);

namespace Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Support\Packages\LatticePackageManager;
use Lattice\Support\Packages\LatticePackageManagerException;

final class UpdateCommand extends Command
{
    protected $signature = 'lattice:update {--dry-run : Show available updates without changing files}';

    protected $description = 'Update installed Composer and npm Lattice packages to the latest stable release';

    public function handle(LatticePackageManager $packages): int
    {
        try {
            $plan = $packages->updatePlan();
        } catch (LatticePackageManagerException $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->table(['Ecosystem', 'Package', 'Installed', 'Latest', 'Action'], $plan->rows());

        $composerOnly = $plan->composerOnlyPackages();

        if ($composerOnly !== []) {
            $this->components->info('Composer-only packages: '.implode(', ', $composerOnly).'.');
        }

        if (! $plan->hasChanges()) {
            $this->components->info('Lattice is already up to date.');

            return self::SUCCESS;
        }

        if ((bool) $this->option('dry-run')) {
            foreach ([...$plan->composerCommands, ...$plan->npmCommands] as $command) {
                $this->line('  '.implode(' ', $command));
            }

            if ($plan->publishAssets) {
                $this->line('  php artisan lattice:assets');
            }

            $this->components->info('Dry run complete. No files were changed.');

            return self::SUCCESS;
        }

        $composerUpdated = false;

        try {
            foreach ($plan->composerCommands as $command) {
                $this->components->task('Updating Lattice Composer packages', fn () => $packages->runComposer($command));
                $composerUpdated = true;
            }
        } catch (LatticePackageManagerException $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        try {
            foreach ($plan->npmCommands as $command) {
                $this->components->task('Updating Lattice npm packages', fn () => $packages->runNpm($command));
            }
        } catch (LatticePackageManagerException $exception) {
            $prefix = $composerUpdated ? 'Composer packages were updated, but the npm update failed. ' : '';
            $this->components->error($prefix.$exception->getMessage());

            return self::FAILURE;
        }

        if ($plan->publishAssets && $this->call('lattice:assets') !== self::SUCCESS) {
            return self::FAILURE;
        }

        $this->components->info("Updated Lattice packages to {$plan->targetVersion}.");

        return self::SUCCESS;
    }
}
