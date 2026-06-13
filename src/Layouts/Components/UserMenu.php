<?php
declare(strict_types=1);

namespace Lattice\Lattice\Layouts\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\ContainerComponent;

#[Attributes\Component('user-menu')]
class UserMenu extends ContainerComponent
{
    public string $name = '';

    public ?string $email = null;

    public ?string $avatar = null;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function name(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function email(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function avatar(?string $avatar): static
    {
        $this->avatar = $avatar;

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
