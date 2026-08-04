<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

trait HasPlaceholder
{
    public ?string $placeholder = null;

    public function placeholder(string $placeholder): static
    {
        $this->placeholder = $placeholder;

        return $this;
    }
}
