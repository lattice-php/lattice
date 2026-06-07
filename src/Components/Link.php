<?php

namespace Bambamboole\Lattice\Components;

class Link extends Component
{
    public static function make(string $label, ?string $key = null): static
    {
        return (new static($key))->prop('label', $label);
    }

    public function href(string $href): static
    {
        return $this->prop('href', $href);
    }

    public function method(string $method): static
    {
        return $this->prop('method', $method);
    }

    public function tabIndex(int $tabIndex): static
    {
        return $this->prop('tabIndex', $tabIndex);
    }

    protected function type(): string
    {
        return 'link';
    }
}
