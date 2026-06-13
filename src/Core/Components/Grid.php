<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;

#[Attributes\Component('grid')]
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
