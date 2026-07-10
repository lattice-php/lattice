<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

trait HasCopyable
{
    public bool $copyable = false;

    public function copyable(bool $copyable = true): static
    {
        $this->copyable = $copyable;

        return $this;
    }
}
