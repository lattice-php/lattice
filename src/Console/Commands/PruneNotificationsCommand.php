<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Notifications\DatabaseNotification;

final class PruneNotificationsCommand extends Command
{
    protected $signature = 'lattice:notifications:prune';

    protected $description = 'Delete read Lattice notifications older than the configured retention window';

    public function handle(): int
    {
        $days = (int) config('lattice.notifications.prune_after_days', 30);

        $deleted = DatabaseNotification::query()
            ->whereNotNull('read_at')
            ->where('created_at', '<', now()->subDays($days))
            ->delete();

        $this->components->info("Pruned {$deleted} read notification(s).");

        return self::SUCCESS;
    }
}
