<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasLabel
{
    public ?string $label = null;

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }
}
