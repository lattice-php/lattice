<?php
declare(strict_types=1);

namespace Lattice\Support\TypeScript;

/**
 * A TypeScript generation role resolved by lattice:typescript: AugmentProfile in
 * a consumer app, BaseProfile in the package's own workbench.
 */
interface TypeScriptProfile
{
    /**
     * Wire packages excluded from TypeScript generation: each hand-writes
     * TypeScript that a generated.ts sibling would collide with —
     * api-reference augments `@lattice-php/core`'s registries directly with
     * no generated.ts of its own yet, and signature-example (though it has
     * no such augmentation) trips the exhaustive `NodeType`/
     * `RegisteredNodeType` check in packages/framework/resources/js/registry.ts
     * once its `signature` node type is discoverable. Phase 3 (declarative
     * hook props) empties this list.
     *
     * @var list<string>
     */
    public const array EMISSION_EXCLUDED = ['api-reference', 'signature-example'];

    /** Run a generation pass and return a summary line for the command to print. */
    public function run(): string;
}
