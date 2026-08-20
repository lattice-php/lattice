<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Concerns\HasLabel;
use Lattice\Ui\Enums\PopoverAlign;
use Lattice\Ui\Enums\PopoverSide;

#[AsComponent('popover')]
class Popover extends ContainerComponent
{
    use HasLabel;

    public PopoverSide $side = PopoverSide::Bottom;

    public PopoverAlign $align = PopoverAlign::Start;

    /**
     * @var array<int, Component>
     */
    public array $trigger = [];

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function side(PopoverSide $side): static
    {
        $this->side = $side;

        return $this;
    }

    public function align(PopoverAlign $align): static
    {
        $this->align = $align;

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
