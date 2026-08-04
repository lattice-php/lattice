<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects;

use JsonSerializable;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Concerns\SerializesToWire;

/**
 * A value object that serializes to `{ type, props }`; the wire `type` is the
 * PHP↔JS discriminant. Custom effects extend this base.
 */
abstract class Effect implements JsonSerializable
{
    use SerializesToWire;

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return ['type' => $this->wireType(), 'props' => Wire::map($this->wireProps())];
    }

    public function wireType(): string
    {
        return AsEffect::wireTypeForClass(static::class);
    }
}
