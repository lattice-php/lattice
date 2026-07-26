<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Support\JsonSchema\JsonSchemaBuilder;
use Lattice\Lattice\Support\JsonSchema\JsonSchemaProfile;
use Lattice\Lattice\Support\JsonSchema\JsonSchemaWriter;

final class SchemaCommand extends Command
{
    protected $signature = 'lattice:schema';

    protected $description = 'Export the Lattice wire-protocol JSON Schema for the current project';

    public function handle(JsonSchemaProfile $profile): int
    {
        $this->components->info($profile->run(new JsonSchemaBuilder, new JsonSchemaWriter));

        return self::SUCCESS;
    }
}
