<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;

#[Attributes\Effect(EffectType::OpenModal)]
final readonly class OpenModalEffect extends Effect
{
    public function __construct(
        public string $modal,
    ) {}
}
