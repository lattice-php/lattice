<?php
declare(strict_types=1);

namespace Lattice\Ui\Effects;

use Inertia\Inertia;

/**
 * Accumulates effects across a request and flashes them, as a single array,
 * into the `latticeEffects` flash bag. Drained client-side by useFlashEffects.
 * Bound as `scoped` so the buffer resets each request.
 *
 * The bag is appended to, never replaced: a redirect carries the effects of
 * the request before it in the bag, and a middleware flashing on the page
 * request that follows must not drop them before the page drains the bag.
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

        $flashed = Inertia::getFlashed()['latticeEffects'] ?? [];

        Inertia::flash('latticeEffects', [...(is_array($flashed) ? array_values($flashed) : []), ...$effects]);
    }

    /**
     * @return array<int, Effect>
     */
    public function all(): array
    {
        return $this->effects;
    }
}
