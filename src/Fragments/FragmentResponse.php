<?php
declare(strict_types=1);

namespace Lattice\Lattice\Fragments;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Ui\Components\Component;

/**
 * The lazy-fragment endpoint payload: the component tree the client renders in
 * place of the fragment's loading skeleton.
 */
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
