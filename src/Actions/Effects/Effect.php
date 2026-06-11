<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Contracts\Effect as EffectContract;
use Lattice\Lattice\Actions\Enums\EffectType;

abstract readonly class Effect implements EffectContract
{
    public const EffectType TYPE = EffectType::ReloadPage;

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return array_filter(
            ['type' => static::TYPE->value, ...get_object_vars($this)],
            fn (mixed $value): bool => $value !== null,
        );
    }
}
