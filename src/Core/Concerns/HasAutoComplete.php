<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasAutoComplete
{
    public function autoComplete(string $autoComplete): static
    {
        return $this->prop('autoComplete', $autoComplete);
    }
}
