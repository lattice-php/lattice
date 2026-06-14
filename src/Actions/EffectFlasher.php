<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Inertia\Inertia;
use Lattice\Lattice\Actions\Effects\AbstractEffect;

/**
 * Accumulates effects across a request and flashes them, as a single array,
 * into the `latticeEffects` flash bag. Drained client-side by useFlashEffects.
 * Bound as `scoped` so the buffer resets each request.
 */
final class EffectFlasher
{
    /**
     * @var array<int, AbstractEffect>
     */
    private array $effects = [];

    public function flash(AbstractEffect ...$effects): void
    {
        if ($effects === []) {
            return;
        }

        array_push($this->effects, ...$effects);

        Inertia::flash('latticeEffects', $this->effects);
    }

    /**
     * @return array<int, AbstractEffect>
     */
    public function all(): array
    {
        return $this->effects;
    }
}
