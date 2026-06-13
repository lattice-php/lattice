<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasAutoFocus
{
    public ?bool $autoFocus = null;

    public function autoFocus(bool $autoFocus = true): static
    {
        $this->autoFocus = $autoFocus;

        return $this;
    }
}
