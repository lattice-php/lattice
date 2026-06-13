<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components\Concerns;

use Lattice\Lattice\Core\Enums\RowLayout;

trait HasRowLayout
{
    public RowLayout $layout = RowLayout::Stack;

    public ?bool $resizableColumns = null;

    public function table(): static
    {
        $this->layout = RowLayout::Table;

        return $this;
    }

    public function resizableColumns(bool $resizable = true): static
    {
        $this->resizableColumns = $resizable ?: null;

        return $this;
    }
}
