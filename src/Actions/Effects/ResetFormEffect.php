<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Spatie\TypeScriptTransformer\Attributes\Optional;

final readonly class ResetFormEffect extends Effect
{
    public const EffectType TYPE = EffectType::ResetForm;

    public function __construct(
        #[Optional]
        public ?string $form = null,
    ) {}
}
