<?php
declare(strict_types=1);

namespace Lattice\Ui\Concerns;

use BackedEnum;
use Lattice\Core\Support\Wire;

trait HasIcon
{
    public ?string $icon = null;

    public function icon(BackedEnum|string $icon): static
    {
        $this->icon = Wire::scalar($icon);

        return $this;
    }
}
