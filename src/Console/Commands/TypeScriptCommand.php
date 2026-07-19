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
        $pending = $profile->pendingTypeCount();

        if ($pending === 0) {
            $this->components->info('No custom Lattice wire types found — the bundled TypeScript types already cover this project. Nothing to generate.');

            return self::SUCCESS;
        }

        if (! class_exists(TypeScriptTransformer::class)) {
            $this->components->error(sprintf(
                'Found %d custom Lattice wire type(s) to generate, but spatie/laravel-typescript-transformer is not installed. Install it with: composer require --dev spatie/laravel-typescript-transformer',
                $pending,
            ));

            return self::FAILURE;
        }

        $this->components->info($profile->run($generator));

        return self::SUCCESS;
    }
}
