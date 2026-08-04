<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Concerns\HasSize;

#[AsComponent('avatar')]
class Avatar extends Component
{
    use HasSize;

    public ?string $src = null;

    public ?string $name = null;

    public static function make(?string $src = null, ?string $key = null): static
    {
        $avatar = new static($key);
        $avatar->src = $src;

        return $avatar;
    }

    public function src(?string $src): static
    {
        $this->src = $src;

        return $this;
    }

    public function name(?string $name): static
    {
        $this->name = $name;

        return $this;
    }
}
