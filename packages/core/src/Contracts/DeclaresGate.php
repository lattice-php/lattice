<?php
declare(strict_types=1);

namespace Lattice\Core\Contracts;

/**
 * Implemented by a class attribute that declares a `can` gate. Authorization
 * resolves it by interface, so a new attribute opts its whole layer into `can`
 * by implementing this and nothing else changes.
 */
interface DeclaresGate
{
    /**
     * The abilities the current user must pass, as declared by `can`.
     *
     * @return array<int, string>
     */
    public function can(): array;

    /**
     * The context key declared by `on`, resolved into the gate subject
     * through {@see ResolvesGateSubject}. Null means the check runs
     * subject-less, as it always did before `on` existed.
     */
    public function on(): ?string;
}
