<?php

declare(strict_types=1);

namespace Lattice\Form\Components\Concerns;

use Lattice\Form\Enums\RowLayout;

trait HasRowLayout
{
    public RowLayout $layout = RowLayout::Stack;

    public ?int $gridColumns = null;

    public bool $resizableColumns = false;

    public bool $resizeIndicator = false;

    public function table(): static
    {
        $this->layout = RowLayout::Table;

        return $this;
    }

    /**
     * Lays the rows out side by side in a grid of the given column count
     * instead of stacking them.
     */
    public function grid(int $columns = 2): static
    {
        $this->layout = RowLayout::Grid;
        $this->gridColumns = max(1, $columns);

        return $this;
    }

    public function resizableColumns(bool $resizable = true, bool $showIndicator = false): static
    {
        $this->resizableColumns = $resizable;
        $this->resizeIndicator = $resizable && $showIndicator;

        return $this;
    }
}
