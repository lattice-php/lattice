<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;

#[Attributes\Component('heading')]
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
}
