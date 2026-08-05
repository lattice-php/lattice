<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Concerns\HasLabel;
use Lattice\Ui\Enums\FloatingPlacement;

#[AsComponent('floating-panel')]
class FloatingPanel extends ContainerComponent
{
    use HasLabel;

    public FloatingPlacement $placement = FloatingPlacement::BottomEnd;

    public int $offset = 16;

    /**
     * @var array<int, Component>
     */
    public array $trigger = [];

    public static function make(?string $key = null): static
    {
        return new static($key);
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

    /**
     * @param  array<int, Component>  $components
     */
    public function trigger(array $components): static
    {
        $this->trigger = $components;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        return [
            ...parent::decorateProps($props),
            'trigger' => $this->renderableComponents($this->trigger),
        ];
    }
}
