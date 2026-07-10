<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;

#[AsComponent('grid')]
class Grid extends ContainerComponent
{
    public ?int $columns = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function columns(int $columns): static
    {
        $this->columns = $columns;

        return $this;
    }
}
