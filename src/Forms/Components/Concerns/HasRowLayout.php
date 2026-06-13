<?php

namespace Lattice\Lattice\Forms\Components\Concerns;

use Lattice\Lattice\Core\Enums\RowLayout;

trait HasRowLayout
{
    public RowLayout $layout = RowLayout::Stack;

    public function table(): static
    {
        $this->layout = RowLayout::Table;

        return $this;
    }
}
