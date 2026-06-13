<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Lattice\Lattice\Core\Enums\ButtonVariant;

trait HasVariant
{
    public ?ButtonVariant $variant = null;

    public function variant(ButtonVariant $variant): static
    {
        $this->variant = $variant;

        return $this;
    }
}
