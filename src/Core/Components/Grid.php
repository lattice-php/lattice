<?php

namespace Lattice\Lattice\Core\Components;

class Grid extends ContainerComponent
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function columns(int $columns): static
    {
        return $this->prop('columns', $columns);
    }

    protected function type(): string
    {
        return 'grid';
    }
}
