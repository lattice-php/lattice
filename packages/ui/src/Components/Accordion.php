<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Enums\Gap;

/**
 * Coordinates its direct `Collapsible` and collapsible `Section` children so
 * at most one is open at a time. A child participates through its key, so
 * every item needs one; nested collapsibles inside an item's content keep
 * their own local state. Clicking the open item closes it — an accordion may
 * have no open item at all.
 */
#[AsComponent('accordion')]
class Accordion extends ContainerComponent
{
    public ?string $defaultOpen = null;

    public ?Gap $gap = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * The key of the child that starts open. Wins over what a participating
     * child declares via `collapsed()`/`rememberState()` — inside an accordion
     * the accordion owns the open state.
     */
    public function defaultOpen(?string $key): static
    {
        $this->defaultOpen = $key;

        return $this;
    }

    public function gap(Gap $gap): static
    {
        $this->gap = $gap;

        return $this;
    }
}
