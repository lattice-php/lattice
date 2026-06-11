<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;

final readonly class ReloadComponentEffect extends Effect
{
    public const EffectType TYPE = EffectType::ReloadComponent;

    public function __construct(
        public string $component,
    ) {}
}
