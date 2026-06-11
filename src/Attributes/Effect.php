<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use Lattice\Lattice\Actions\Enums\EffectType;

#[Attribute(Attribute::TARGET_CLASS)]
final class Effect
{
    public function __construct(public readonly EffectType $type) {}
}
