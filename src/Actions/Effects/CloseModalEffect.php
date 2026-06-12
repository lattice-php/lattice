<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;

#[Attributes\Effect(EffectType::CloseModal)]
final readonly class CloseModalEffect extends Effect
{
    public function __construct(
        public ?string $modal = null,
    ) {}
}
