<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;

#[Attributes\Component('action.group')]
class ActionGroup extends ContainerComponent
{
    use IsInteractive;

    public string $label = 'Actions';

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
