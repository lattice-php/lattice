<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components\Concerns;

trait HasMinMax
{
    public ?string $min = null;

    public ?string $max = null;

    public function min(string $min): static
    {
        $this->min = $min;

        return $this;
    }

    public function max(string $max): static
    {
        $this->max = $max;

        return $this;
    }
}
