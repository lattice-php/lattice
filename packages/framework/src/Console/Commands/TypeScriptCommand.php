<?php
declare(strict_types=1);

namespace Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Support\TypeScript\EmptyDiscoveryException;
use Lattice\Support\TypeScript\TypeScriptProfile;

final class TypeScriptCommand extends Command
{
    protected $signature = 'lattice:typescript';

    protected $description = 'Generate Lattice TypeScript types for the current project';

    public function handle(TypeScriptProfile $profile): int
    {
        try {
            $this->components->info($profile->run());
        } catch (EmptyDiscoveryException $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
