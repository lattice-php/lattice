<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;
use Spatie\TypeScriptTransformer\Attributes\Optional;

#[Attributes\Effect(EffectType::CloseModal)]
final readonly class CloseModalEffect extends Effect
{
    public function __construct(
        #[Optional]
        public ?string $modal = null,
    ) {}
}
