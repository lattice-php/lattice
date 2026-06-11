<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;

final readonly class ReloadComponentEffect implements Effect
{
    public function __construct(
        public string $component,
    ) {}

    /**
     * @return array{type: string, component: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => EffectType::ReloadComponent->value,
            'component' => $this->component,
        ];
    }
}
