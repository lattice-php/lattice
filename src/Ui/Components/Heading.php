<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Concerns\HasCopyable;
use Lattice\Lattice\Ui\Concerns\HasTooltip;

#[AsComponent('heading')]
class Heading extends Component
{
    use HasCopyable;
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
