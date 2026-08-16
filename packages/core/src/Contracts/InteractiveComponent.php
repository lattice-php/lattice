<?php
declare(strict_types=1);

namespace Lattice\Core\Contracts;

/**
 * A wire component that carries a sealed reference and its render context —
 * what the registry gate needs to promise about anything it seals.
 */
interface InteractiveComponent
{
    public function signedAs(string $signatureKey): static;

    /**
     * @param  array<string, mixed>  $context
     */
    public function context(array $context): static;

    /**
     * Merge $context beneath the existing context — explicit keys set at
     * build time win — while $override forces its keys over both.
     *
     * @param  array<string, mixed>  $context
     * @param  array<string, mixed>  $override
     */
    public function mergeContext(array $context, array $override = []): static;
}
