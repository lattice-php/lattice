<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;

#[Attributes\AsEffect(EffectType::Redirect)]
final readonly class RedirectEffect extends AbstractEffect
{
    public function __construct(
        public string $url,
    ) {}
}
