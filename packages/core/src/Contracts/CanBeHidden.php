<?php

declare(strict_types=1);

namespace Lattice\Core\Contracts;

interface CanBeHidden
{
    public function hidden(bool $condition = true): static;
}
