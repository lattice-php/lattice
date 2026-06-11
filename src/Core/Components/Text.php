<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Core\Enums\Align;

class Text extends Component
{
    public string $text = '';

    public ?Align $align = null;

    public static function make(string $text, ?string $key = null): static
    {
        $component = new static($key);
        $component->text = $text;

        return $component;
    }

    public function align(Align $align): static
    {
        $this->align = $align;

        return $this;
    }

    protected function type(): string
    {
        return 'text';
    }
}
