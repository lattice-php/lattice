<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Attributes;

use Attribute;
use Lattice\Lattice\Effects\Enums\EffectType;

/**
 * Marks an effect value object and declares its wire type — the PHP↔JS
 * discriminant. Built-ins pass the EffectType enum for type-safety; consumers
 * pass a raw string. Discovery shares ClassWalker, but the attribute stays
 * distinct by design (effects form the discriminated `Effect` union, not the
 * node hierarchy).
 */
#[Attribute(Attribute::TARGET_CLASS)]
final class AsEffect
{
    public function __construct(public readonly EffectType|string $type) {}

    public function wireType(): string
    {
        return $this->type instanceof EffectType ? $this->type->value : $this->type;
    }
}
