<?php
declare(strict_types=1);

namespace Lattice\Ui\Effects;

use JsonSerializable;
use Lattice\Core\Support\Wire;
use Lattice\Ui\Components\Concerns\SerializesToWire;
use Lattice\Ui\Effects\Attributes\AsEffect;

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
