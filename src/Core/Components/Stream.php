<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;

#[Attributes\Component('stream')]
class Stream extends Component
{
    public ?string $endpoint = null;

    public bool $auto = true;

    public ?string $placeholder = null;

    public static function make(string $key): static
    {
        return new static($key);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function auto(bool $auto): static
    {
        $this->auto = $auto;

        return $this;
    }

    public function placeholder(string $placeholder): static
    {
        $this->placeholder = $placeholder;

        return $this;
    }
}
