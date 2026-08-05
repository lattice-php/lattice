<?php
declare(strict_types=1);

namespace Lattice\Fragments;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;

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
