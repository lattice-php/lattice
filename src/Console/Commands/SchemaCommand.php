<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Support\WireSchema\WireSchemaBuilder;
use Lattice\Lattice\Support\WireSchema\WireSchemaProfile;
use Lattice\Lattice\Support\WireSchema\WireSchemaWriter;

final class SchemaCommand extends Command
{
    protected $signature = 'lattice:schema';

    protected $description = 'Export the Lattice wire-protocol JSON Schema for the current project';

    public function handle(WireSchemaProfile $profile): int
    {
        $this->components->info($profile->run(new WireSchemaBuilder, new WireSchemaWriter));

        return self::SUCCESS;
    }
}
