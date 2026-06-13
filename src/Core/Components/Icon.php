<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use BackedEnum;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Enums\Color;
use Lattice\Lattice\Core\Enums\Size;

#[Attributes\Component('icon')]
class Icon extends Component
{
    public string $name = '';

    public Size $size = Size::Md;

    public ?Color $color = null;

    public ?string $class = null;

    public static function make(BackedEnum|string $name, ?string $key = null): static
    {
        $icon = new static($key);
        $icon->name = (string) $icon->enumValue($name);

        return $icon;
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

    public function class(string $class): static
    {
        $this->class = $class;

        return $this;
    }
}
