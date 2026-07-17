<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\ContainerComponent;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;
use Lattice\Lattice\Ui\Enums\Placement;

#[AsComponent('dropdown')]
class Dropdown extends ContainerComponent
{
    /**
     * @var array<int, Component>
     */
    public array $trigger = [];

    public Placement $placement = Placement::Bottom;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    /**
     * @param  array<int, Component>  $components
     */
    public function trigger(array $components): static
    {
        $this->trigger = $components;

        return $this;
    }

    public function placement(Placement $placement): static
    {
        $this->placement = $placement;

        return $this;
    }

    /**
     * @param  array<int, SchemaEntry>  $items
     */
    public function items(array $items): static
    {
        return $this->schema($items);
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
