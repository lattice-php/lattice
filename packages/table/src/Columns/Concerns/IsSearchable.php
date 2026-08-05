<?php
declare(strict_types=1);

namespace Lattice\Table\Columns\Concerns;

trait IsSearchable
{
    protected bool $searchableEnabled = false;

    public function searchable(bool $searchable = true): static
    {
        $this->searchableEnabled = $searchable;

        return $this;
    }

    public function isSearchable(): bool
    {
        return $this->searchableEnabled;
    }
}
