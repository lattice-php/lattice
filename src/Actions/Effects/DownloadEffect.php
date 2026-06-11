<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;

final readonly class DownloadEffect extends Effect
{
    public const EffectType TYPE = EffectType::Download;

    public function __construct(
        public string $url,
    ) {}
}
