<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;

final readonly class ReloadPageEffect implements Effect
{
    /**
     * @return array{type: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => EffectType::ReloadPage->value,
        ];
    }
}
