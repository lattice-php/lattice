<?php
declare(strict_types=1);

namespace Lattice\Form;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Form\Components\Field;

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
