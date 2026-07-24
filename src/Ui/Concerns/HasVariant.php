<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

use Lattice\Lattice\Ui\Enums\Emphasis;
use Lattice\Lattice\Ui\Enums\Variant;

trait HasVariant
{
    public ?Variant $variant = null;

    public ?Emphasis $emphasis = null;

    public function variant(Variant $variant): static
    {
        $this->variant = $variant;

        return $this;
    }

    public function emphasis(Emphasis $emphasis): static
    {
        $this->emphasis = $emphasis;

        return $this;
    }
}
