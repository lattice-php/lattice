<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

trait HasTabIndex
{
    public ?int $tabIndex = null;

    public function tabIndex(int $tabIndex): static
    {
        $this->tabIndex = $tabIndex;

        return $this;
    }
}
