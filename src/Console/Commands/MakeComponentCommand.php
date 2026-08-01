<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;

final class MakeComponentCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:component {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice UI component (PHP + React)';

    public function handle(): int
    {
        $target = $this->scaffoldTarget((string) $this->argument('name'), 'Components', 'components');
        $type = $this->option('type') ?: $this->typeFromName($target['class'], '');

        return $this->writePair('Component', $target, 'component', $type, $type, $type, 'Component');
    }
}
