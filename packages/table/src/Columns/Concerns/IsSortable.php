<?php
declare(strict_types=1);

namespace Lattice\Table\Columns\Concerns;

trait IsSortable
{
    protected bool $sortableEnabled = false;

    public function sortable(bool $sortable = true): static
    {
        $this->sortableEnabled = $sortable;

        return $this;
    }

    public function isSortable(): bool
    {
        return $this->sortableEnabled;
    }
}
