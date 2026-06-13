<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components\Concerns;

use Lattice\Lattice\Core\Enums\RowLayout;

trait HasRowLayout
{
    public RowLayout $layout = RowLayout::Stack;

    public ?bool $resizableColumns = null;

    public bool $resizeIndicator = false;

    public function table(): static
    {
        $this->layout = RowLayout::Table;

        return $this;
    }

    public function resizableColumns(bool $resizable = true, bool $showIndicator = false): static
    {
        $this->resizableColumns = $resizable ?: null;
        $this->resizeIndicator = $resizable && $showIndicator;

        return $this;
    }
}
