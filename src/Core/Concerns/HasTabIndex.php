<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasTabIndex
{
    public function tabIndex(int $tabIndex): static
    {
        return $this->prop('tabIndex', $tabIndex);
    }
}
