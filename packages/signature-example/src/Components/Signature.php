<?php

declare(strict_types=1);

namespace Lattice\SignatureExample\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Component;

#[AsComponent('signature')]
final class Signature extends Component
{
    public string $label = 'Sign here';

    public static function make(?string $key = null): static
    {
        return new self($key);
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }
}
