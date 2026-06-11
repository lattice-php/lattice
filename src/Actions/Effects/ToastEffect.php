<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\Optional;

#[Attributes\Effect(EffectType::Toast)]
final readonly class ToastEffect extends Effect
{
    public function __construct(
        public ToastVariant $variant,
        public string $message,
        #[Optional]
        public ?int $duration = null,
        public bool $persistent = false,
        public bool $dismissible = true,
        #[Optional]
        #[LiteralTypeScriptType('Node')]
        public ?Component $action = null,
    ) {}
}
