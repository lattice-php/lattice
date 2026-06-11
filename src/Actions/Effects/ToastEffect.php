<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Core\Enums\ToastVariant;

final readonly class ToastEffect extends Effect
{
    public const EffectType TYPE = EffectType::Toast;

    public function __construct(
        public ToastVariant $variant,
        public string $message,
    ) {}
}
