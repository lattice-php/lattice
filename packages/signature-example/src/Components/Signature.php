<?php

declare(strict_types=1);

namespace Lattice\SignatureExample\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Component;

#[AsComponent('signature')]
final class Signature extends Component
{
    public ?string $label = null;

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
