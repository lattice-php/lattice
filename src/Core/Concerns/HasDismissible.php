<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasDismissible
{
    public bool $dismissible = true;

    public function dismissible(bool $dismissible = true): static
    {
        $this->dismissible = $dismissible;

        return $this;
    }
}
