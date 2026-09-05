<?php
declare(strict_types=1);

namespace Lattice\Form;

/**
 * Deliberately not under `Enums/`: that folder is the wire vocabulary the
 * public enum reference is generated from, and this one never leaves the
 * server — it is the return channel of a value-resolver closure.
 *
 * What a value resolver decided this pass. Returning a value — `null`
 * included — is a decision to write it; `Keep` is the way to decide nothing
 * and leave whatever is already in the field alone.
 */
enum Resolution
{
    /**
     * Leave the field's current value untouched: the resolver has nothing to
     * say this pass. Without it a resolver that cannot compute a value has to
     * echo the submitted one back, because `null` clears the field.
     */
    case Keep;
}
