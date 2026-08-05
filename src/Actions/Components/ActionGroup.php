<?php
declare(strict_types=1);

namespace Lattice\Actions\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Ui\Components\ContainerComponent;
use Lattice\Ui\Components\IsInteractive;
use Lattice\Ui\Concerns\HasLabel;
use Lattice\Ui\Contracts\SchemaEntry;
use Lattice\Ui\Enums\Orientation;

#[AsComponent('action.group')]
class ActionGroup extends ContainerComponent implements InteractiveComponent
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
     * @param  array<int, SchemaEntry>  $actions
     */
    public function actions(array $actions): static
    {
        return $this->schema($actions);
    }
}
