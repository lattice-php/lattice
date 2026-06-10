<?php

namespace Lattice\Lattice\Core\Components;

class Heading extends Component
{
    public string $text = '';

    public int $level = 1;

    public static function make(string $text, int $level = 1, ?string $key = null): static
    {
        $heading = new static($key);
        $heading->text = $text;
        $heading->level = $level;

        return $heading;
    }

    protected function type(): string
    {
        return 'heading';
    }
}
