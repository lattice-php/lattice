<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;
use Lattice\Lattice\Forms\Enums\FieldType;

final class MakeFieldCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:field {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice form field (PHP + React)';

    public function handle(): int
    {
        $target = $this->scaffoldTarget((string) $this->argument('name'), 'Forms/Fields', 'fields');
        $type = $this->option('type') ?: $this->typeFromName($target['class'], '');
        $wireType = FieldType::wireType($type);

        return $this->writePair('Field', $target, 'field', FieldType::localType($type), $wireType, $wireType, 'Component');
    }
}
