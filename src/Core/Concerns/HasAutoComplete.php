<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasAutoComplete
{
    public ?string $autoComplete = null;

    public function autoComplete(string $autoComplete): static
    {
        $this->autoComplete = $autoComplete;

        return $this;
    }
}
