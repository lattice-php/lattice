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
}
