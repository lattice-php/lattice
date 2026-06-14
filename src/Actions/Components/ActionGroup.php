<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Enums\Orientation;

#[Attributes\Component('action.group')]
class ActionGroup extends ContainerComponent
{
    use IsInteractive;

    public string $label = 'Actions';

    public ?Orientation $orientation = null;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function inline(Orientation $orientation = Orientation::Horizontal): static
    {
        $this->orientation = $orientation;

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
