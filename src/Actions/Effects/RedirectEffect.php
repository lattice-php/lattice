<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;

final readonly class RedirectEffect extends Effect
{
    public const EffectType TYPE = EffectType::Redirect;

    public function __construct(
        public string $url,
    ) {}
}
