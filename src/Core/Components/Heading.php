<?php

namespace Lattice\Lattice\Core\Components;

class Heading extends Component
{
    public static function make(string $text, int $level = 1, ?string $key = null): static
    {
        return (new static($key))->props([
            'text' => $text,
            'level' => $level,
        ]);
    }

    protected function type(): string
    {
        return 'heading';
    }
}
