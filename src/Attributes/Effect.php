<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use Lattice\Lattice\Actions\Enums\EffectType;

/**
 * Marks an action effect value object. Effects form the discriminated `Effect`
 * union (a value object plus a `type` discriminant), not the node hierarchy.
 * Discovery shares ClassWalker, but the attribute stays distinct by design.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final class Effect
{
    public function __construct(public readonly EffectType $type) {}
}
