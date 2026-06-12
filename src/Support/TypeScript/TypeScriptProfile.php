<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

/**
 * A TypeScript generation role. The `lattice:typescript` command resolves one
 * from the container and runs it: a consumer app gets the default AugmentProfile
 * (extending the package's published types), while the package's own dev
 * environment binds the BaseProfile (regenerating those base types).
 */
interface TypeScriptProfile
{
    /**
     * Assemble and run a generation pass, returning a human-readable summary
     * line for the command to print.
     */
    public function run(TypeScriptGenerator $generator): string;
}
