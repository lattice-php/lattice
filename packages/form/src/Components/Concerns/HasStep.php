<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components\Concerns;

trait HasStep
{
    public ?int $step = null;

    public function step(int $step): static
    {
        $this->step = $step;

        return $this;
    }
}
