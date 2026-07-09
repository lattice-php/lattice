<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait GatesRendering
{
    protected bool $shouldRender = true;

    public function when(bool $condition): static
    {
        $this->shouldRender = $condition;

        return $this;
    }

    public function shouldRender(): bool
    {
        return $this->shouldRender;
    }
}
