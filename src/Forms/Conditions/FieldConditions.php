<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Conditions;

use Lattice\Lattice\Attributes\TypeScript;

/**
 * The four condition intents a field declares, as the value object that
 * serializes to its `conditions` wire shape. A field without any conditions
 * serializes to `null` rather than this object.
 */
#[TypeScript]
final readonly class FieldConditions
{
    /**
     * @param  list<Condition>  $visible
     * @param  list<Condition>  $required
     * @param  list<Condition>  $readOnly
     * @param  list<Condition>  $disabled
     */
    public function __construct(
        public array $visible,
        public array $required,
        public array $readOnly,
        public array $disabled,
    ) {}
}
