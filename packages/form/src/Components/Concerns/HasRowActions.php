<?php
declare(strict_types=1);

namespace Lattice\Form\Components\Concerns;

use Lattice\Form\Components\RowAction;
use Lattice\Ui\Concerns\FiltersRenderableComponents;

trait HasRowActions
{
    use FiltersRenderableComponents;

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
        $this->rowActions = $this->renderableComponents($actions);

        return $this;
    }
}
