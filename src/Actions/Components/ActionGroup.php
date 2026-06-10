<?php

namespace Lattice\Lattice\Actions\Components;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;

class ActionGroup extends ContainerComponent
{
    use IsInteractive;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    public function label(string $label): static
    {
        return $this->prop('label', $label);
    }

    /**
     * @param  array<int, Component>  $actions
     */
    public function actions(array $actions): static
    {
        return $this->children($actions);
    }

    protected function type(): string
    {
        return 'action.group';
    }
}
