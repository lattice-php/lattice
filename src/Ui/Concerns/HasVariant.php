<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

use Lattice\Lattice\Ui\Enums\ButtonVariant;

trait HasVariant
{
    public ?ButtonVariant $variant = null;

    public function variant(ButtonVariant $variant): static
    {
        $this->variant = $variant;

        return $this;
    }
}
