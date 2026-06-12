<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;

#[Attributes\Component('section')]
class Section extends ContainerComponent
{
    public ?string $title = null;

    public ?string $description = null;

    public bool $collapsible = false;

    public bool $collapsed = false;

    public bool $rememberState = true;

    /**
     * @var array<int, Component>
     */
    public array $headerActions = [];

    public static function make(?string $title = null, ?string $description = null, ?string $key = null): static
    {
        $section = new static($key);

        if ($title !== null) {
            $section->title = $title;
        }

        if ($description !== null) {
            $section->description = $description;
        }

        return $section;
    }

    public function collapsible(bool $collapsible = true, bool $collapsed = false, bool $rememberState = true): static
    {
        $this->collapsible = $collapsible;
        $this->collapsed = $collapsed;
        $this->rememberState = $rememberState;

        return $this;
    }

    /**
     * @param  array<int, Component>  $actions
     */
    public function headerActions(array $actions): static
    {
        $this->headerActions = $actions;

        return $this;
    }
}
