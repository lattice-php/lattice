<?php

namespace Bambamboole\Lattice\Components;

class Tabs extends Component
{
    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function defaultValue(string $value): static
    {
        return $this->prop('defaultValue', $value);
    }

    protected function type(): string
    {
        return 'tabs';
    }
}
