<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;

#[Attributes\AsEffect(EffectType::Download)]
final readonly class DownloadEffect extends AbstractEffect
{
    public function __construct(
        public string $url,
    ) {}
}
