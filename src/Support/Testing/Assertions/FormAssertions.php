<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing\Assertions;

use Lattice\Lattice\Support\Testing\ComponentNode;

final class FormAssertions
{
    public function __construct(
        private readonly ComponentNode $node,
        private readonly ComponentAssertions $root,
    ) {}

    public function end(): ComponentAssertions
    {
        return $this->root;
    }
}
