<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

/**
 * A TypeScript generation role resolved by lattice:typescript: AugmentProfile in
 * a consumer app, BaseProfile in the package's own workbench.
 */
interface TypeScriptProfile
{
    /**
     * App-defined wire types this profile would emit. Zero means the bundled
     * types already cover the project and no transformer is needed.
     */
    public function pendingTypeCount(): int;

    /** Run a generation pass and return a summary line for the command to print. */
    public function run(TypeScriptGenerator $generator): string;
}
