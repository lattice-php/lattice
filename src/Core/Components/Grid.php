<?php

namespace Lattice\Lattice\Core\Components;

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

    protected function type(): string
    {
        return 'grid';
    }
}
