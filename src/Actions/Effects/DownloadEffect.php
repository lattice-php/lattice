<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;

#[Attributes\Effect(EffectType::Download)]
final readonly class DownloadEffect extends Effect
{
    public function __construct(
        public string $url,
    ) {}
}
