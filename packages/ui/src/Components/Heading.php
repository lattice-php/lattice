<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Concerns\HasPrimaryBinding;
use Lattice\Ui\Concerns\HasCopyable;
use Lattice\Ui\Concerns\HasTooltip;

#[AsComponent('heading')]
class Heading extends Component
{
    use HasCopyable;
    use HasPrimaryBinding;
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

    protected static function primaryBindableProp(): string
    {
        return 'text';
    }
}
