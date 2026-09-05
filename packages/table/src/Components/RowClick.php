<?php
declare(strict_types=1);

namespace Lattice\Table\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Concerns\Triggerable;

/**
 * What a click on a whole table row does: the same trigger surface as Button
 * and Link — navigate to an `href`, run an `action`, dispatch `effects`, or
 * open a `modal`. The row payload carries it as a node the client reads props
 * off; it is never placed in a schema and renders nothing.
 */
#[AsComponent('table.row-click')]
final class RowClick extends Component
{
    use Triggerable;

    public static function make(): static
    {
        return new self;
    }

    /**
     * An unauthorized action leaves the row unclickable instead of shipping a
     * node that refuses to serialize.
     */
    #[\Override]
    public function shouldRender(): bool
    {
        return parent::shouldRender() && (! $this->action instanceof Component || $this->action->shouldRender());
    }
}
