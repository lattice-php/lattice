<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components\Concerns;

use Lattice\Lattice\Forms\Components\RowAction;

trait HasRowActions
{
    /**
     * @var array<int, RowAction>
     */
    public array $rowActions = [];

    /**
     * @param  array<int, RowAction>  $actions
     */
    public function rowActions(array $actions): static
    {
        $this->rowActions = $actions;

        return $this;
    }
}
