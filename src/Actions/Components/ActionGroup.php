<?php

namespace Lattice\Lattice\Actions\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;

#[Attributes\Component('action.group', container: true, interactive: true)]
class ActionGroup extends ContainerComponent
{
    use IsInteractive;

    public ?string $label = null;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    /**
     * @param  array<int, Component>  $actions
     */
    public function actions(array $actions): static
    {
        return $this->schema($actions);
    }
}
