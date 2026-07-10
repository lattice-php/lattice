<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

trait HasKeyedLabel
{
    public string $label;

    protected function initializeLabel(): void
    {
        $this->label = str($this->key)->headline()->toString();
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }
}
