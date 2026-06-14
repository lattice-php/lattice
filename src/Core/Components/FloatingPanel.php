<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Enums\FloatingPlacement;

#[Attributes\Component('floating-panel')]
class FloatingPanel extends ContainerComponent
{
    public ?string $label = null;

    public FloatingPlacement $placement = FloatingPlacement::BottomEnd;

    public int $offset = 16;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function placement(FloatingPlacement $placement): static
    {
        $this->placement = $placement;

        return $this;
    }

    public function offset(int $offset): static
    {
        $this->offset = $offset;

        return $this;
    }
}
