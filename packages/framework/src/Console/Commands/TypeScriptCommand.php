<?php
declare(strict_types=1);

namespace Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Support\TypeScript\TypeScriptProfile;

final class TypeScriptCommand extends Command
{
    protected $signature = 'lattice:typescript';

    protected $description = 'Generate Lattice TypeScript types for the current project';

    public function handle(TypeScriptProfile $profile): int
    {
        $this->components->info($profile->run());

        return self::SUCCESS;
    }
}
