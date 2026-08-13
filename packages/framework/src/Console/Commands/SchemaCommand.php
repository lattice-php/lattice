<?php
declare(strict_types=1);

namespace Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Core\JsonSchema\SchemaDocumentWriter;
use Lattice\Core\Wire\WireModelBuilder;
use Lattice\Support\Schema\SchemaProfile;

final class SchemaCommand extends Command
{
    protected $signature = 'lattice:schema';

    protected $description = 'Export the Lattice wire-protocol JSON Schema for the current project';

    public function handle(SchemaProfile $profile, WireModelBuilder $builder, SchemaDocumentWriter $writer): int
    {
        $this->components->info($profile->run($builder, $writer));

        return self::SUCCESS;
    }
}
