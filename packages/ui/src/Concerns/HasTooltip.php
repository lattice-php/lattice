<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

trait HasTooltip
{
    public ?string $tooltip = null;

    public function tooltip(string $tooltip): static
    {
        $this->tooltip = $tooltip;

        return $this;
    }
}
