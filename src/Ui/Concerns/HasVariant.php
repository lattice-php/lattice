<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

use Lattice\Lattice\Ui\Enums\ButtonVariant;
use Lattice\Lattice\Ui\Enums\Intent;

trait HasVariant
{
    public ?ButtonVariant $variant = null;

    public ?Intent $color = null;

    public function variant(ButtonVariant $variant): static
    {
        $this->variant = $variant;

        return $this;
    }

    public function color(Intent $color): static
    {
        $this->color = $color;

        return $this;
    }
}
