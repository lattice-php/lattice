<?php

declare(strict_types=1);

namespace Workbench\App\Components;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Components\Component as BaseComponent;

#[Component('workbench.chat')]
class ChatBox extends BaseComponent
{
    public ?string $endpoint = null;

    public static function make(string $key): static
    {
        return new static($key);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }
}
