<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasCopyable;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Color;
use Lattice\Lattice\Core\Enums\Size;

#[AsComponent('text')]
class Text extends Component
{
    use HasCopyable;

    public string $text = '';

    public ?Align $align = null;

    public Size $size = Size::Md;

    public Color $color = Color::Muted;

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

    public function size(Size $size): static
    {
        $this->size = $size;

        return $this;
    }

    public function color(Color $color): static
    {
        $this->color = $color;

        return $this;
    }
}
