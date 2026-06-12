<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

/**
 * A TypeScript generation role resolved by lattice:typescript: AugmentProfile in
 * a consumer app, BaseProfile in the package's own workbench.
 */
interface TypeScriptProfile
{
    /** Run a generation pass and return a summary line for the command to print. */
    public function run(TypeScriptGenerator $generator): string;
}
