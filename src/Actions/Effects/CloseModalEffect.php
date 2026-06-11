<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Spatie\TypeScriptTransformer\Attributes\Optional;

final readonly class CloseModalEffect extends Effect
{
    public const EffectType TYPE = EffectType::CloseModal;

    public function __construct(
        #[Optional]
        public ?string $modal = null,
    ) {}
}
