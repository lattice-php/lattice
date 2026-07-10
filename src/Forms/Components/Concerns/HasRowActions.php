<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components\Concerns;

use Lattice\Lattice\Forms\Components\RowAction;

trait HasRowActions
{
    /**
     * Null until declared, so the client can tell "undeclared" (use the default
     * menu) apart from an explicit empty list (no row actions at all).
     *
     * @var array<int, RowAction>|null
     */
    public ?array $rowActions = null;

    /**
     * @param  array<int, RowAction>  $actions
     */
    public function rowActions(array $actions): static
    {
        $this->rowActions = array_values(array_filter(
            $actions,
            static fn (RowAction $action): bool => $action->shouldRender(),
        ));

        return $this;
    }
}
