<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

trait HasAutoFocus
{
    public bool $autoFocus = false;

    public function autoFocus(bool $autoFocus = true): static
    {
        $this->autoFocus = $autoFocus;

        return $this;
    }
}
