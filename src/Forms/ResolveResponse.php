<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Forms\Components\Field;

/**
 * The form `_resolve` round-trip payload: the recomputed computed fields, their
 * resolved values, and prefilled values, each keyed by field path.
 */
#[TypeScript]
final readonly class ResolveResponse
{
    /**
     * @param  array<string, Field>  $fields
     * @param  array<string, mixed>  $values
     * @param  array<string, mixed>  $prefill
     */
    public function __construct(
        public array $fields,
        public array $values,
        public array $prefill,
    ) {}
}
