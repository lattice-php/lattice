<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Concerns\HasColor;
use Lattice\Lattice\Ui\Concerns\HasSize;
use Lattice\Lattice\Ui\Enums\ProgressShape;

#[AsComponent('progress')]
class Progress extends Component
{
    use HasColor;
    use HasSize;

    public float $value = 0.0;

    public float $max = 100.0;

    public ProgressShape $shape = ProgressShape::Bar;

    public bool $showValue = false;

    public static function bar(float $value = 0.0, ?string $key = null): static
    {
        $component = new static($key);
        $component->value = $value;

        return $component;
    }

    public static function circle(float $value = 0.0, ?string $key = null): static
    {
        $component = new static($key);
        $component->value = $value;
        $component->shape = ProgressShape::Circle;

        return $component;
    }

    public function value(float $value): static
    {
        $this->value = $value;

        return $this;
    }

    public function max(float $max): static
    {
        $this->max = $max;

        return $this;
    }

    public function showValue(bool $show = true): static
    {
        $this->showValue = $show;

        return $this;
    }
}
