<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Support\TypeScript\TypeScriptGenerator;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;
use Spatie\TypeScriptTransformer\TypeScriptTransformer;

final class TypeScriptCommand extends Command
{
    protected $signature = 'lattice:typescript';

    protected $description = 'Generate Lattice TypeScript types for the current project';

    public function handle(TypeScriptProfile $profile, TypeScriptGenerator $generator): int
    {
        if (! class_exists(TypeScriptTransformer::class)) {
            $this->components->error('lattice:typescript needs spatie/typescript-transformer. Install it with: composer require --dev spatie/typescript-transformer');

            return self::FAILURE;
        }

        $this->components->info($profile->run($generator));

        return self::SUCCESS;
    }
}
