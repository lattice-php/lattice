<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects;

use Inertia\Inertia;
use Lattice\Lattice\Effects\Contracts\Effect;

/**
 * Accumulates effects across a request and flashes them, as a single array,
 * into the `latticeEffects` flash bag. Drained client-side by useFlashEffects.
 * Bound as `scoped` so the buffer resets each request.
 */
final class EffectFlasher
{
    /**
     * @var array<int, Effect>
     */
    private array $effects = [];

    public function flash(Effect ...$effects): void
    {
        if ($effects === []) {
            return;
        }

        array_push($this->effects, ...$effects);

        Inertia::flash('latticeEffects', $this->effects);
    }

    /**
     * @return array<int, Effect>
     */
    public function all(): array
    {
        return $this->effects;
    }
}
