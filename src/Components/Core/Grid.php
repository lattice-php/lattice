<?php

namespace Bambamboole\Lattice\Components\Core;

class Grid extends Component
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
