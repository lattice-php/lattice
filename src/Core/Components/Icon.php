<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use BackedEnum;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasColor;
use Lattice\Lattice\Core\Concerns\HasSize;
use Lattice\Lattice\Core\Enums\Color;
use Lattice\Lattice\Support\Wire;

#[AsComponent('icon')]
class Icon extends Component
{
    use HasColor;
    use HasSize;

    public string $name = '';

    public ?Color $color = null;

    public ?string $class = null;

    public static function make(BackedEnum|string $name, ?string $key = null): static
    {
        $icon = new static($key);
        $icon->name = Wire::scalar($name);

        return $icon;
    }

    public function class(string $class): static
    {
        $this->class = $class;

        return $this;
    }
}
