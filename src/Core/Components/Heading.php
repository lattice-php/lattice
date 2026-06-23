<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasTooltip;

#[AsComponent('heading')]
class Heading extends Component
{
    use HasTooltip;

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
