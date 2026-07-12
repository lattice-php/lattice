<?php
declare(strict_types=1);

namespace Lattice\Lattice\Fragments;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Ui\Components\Component;

#[TypeScript]
final readonly class FragmentResponse
{
    /**
     * @param  list<Component>  $schema
     */
    public function __construct(
        public array $schema,
    ) {}
}
