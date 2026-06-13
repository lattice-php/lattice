<?php

declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use BackedEnum;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;

#[Attributes\Component('dropdown')]
class Dropdown extends ContainerComponent
{
    public string $label = '';

    public ?string $icon = null;

    public static function make(string $label, ?string $key = null): static
    {
        $dropdown = new static($key);
        $dropdown->label = $label;

        return $dropdown;
    }

    public function icon(BackedEnum|string $icon): static
    {
        $this->icon = $this->enumValue($icon);

        return $this;
    }

    /**
     * @param  array<int, Component>  $items
     */
    public function items(array $items): static
    {
        return $this->schema($items);
    }
}
