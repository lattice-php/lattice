<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;

final readonly class OpenModalEffect implements Effect
{
    public function __construct(
        public string $modal,
    ) {}

    /**
     * @return array{type: string, modal: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => EffectType::OpenModal->value,
            'modal' => $this->modal,
        ];
    }
}
