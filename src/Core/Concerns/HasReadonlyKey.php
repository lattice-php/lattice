<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

/**
 * Requires the consuming class to promote `protected readonly string $key`
 * in its constructor — constructor promotion cannot live in a trait.
 */
trait HasReadonlyKey
{
    /**
     * The instance's data identity. Distinct from Component's `key(string)`,
     * which is a setter for the render/reconciliation hint — a different
     * concept entirely, not unified here on purpose.
     */
    public function key(): string
    {
        return $this->key;
    }

    protected function wireKey(): ?string
    {
        return $this->key;
    }
}
