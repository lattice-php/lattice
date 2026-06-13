<?php

namespace Lattice\Lattice\Forms\Components\Concerns;

trait HasRowLayout
{
    public string $layout = 'stack';

    public function table(): static
    {
        $this->layout = 'table';

        return $this;
    }
}
