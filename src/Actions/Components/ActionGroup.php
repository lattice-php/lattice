<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Concerns\HasLabel;
use Lattice\Lattice\Core\Enums\Orientation;

#[AsComponent('action.group')]
class ActionGroup extends ContainerComponent
{
    use HasLabel;
    use IsInteractive;

    public ?Orientation $orientation = null;

    public static function make(string $id): static
    {
        return (new static)->id($id);
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
