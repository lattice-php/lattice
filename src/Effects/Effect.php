<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Ui\Components\Concerns\SerializesToWire;

abstract readonly class Effect implements EffectContract
{
    use SerializesToWire;

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return ['type' => $this->wireType(), ...$this->wireProps()];
    }

    public function wireType(): string
    {
        /** @var array<class-string, string> $cache */
        static $cache = [];

        return $cache[static::class] ??= AsEffect::wireTypeForClass(static::class);
    }
}
