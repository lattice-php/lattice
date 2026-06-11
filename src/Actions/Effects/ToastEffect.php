<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Core\Enums\ToastVariant;

final readonly class ToastEffect implements Effect
{
    public function __construct(
        public ToastVariant $variant,
        public string $message,
    ) {}

    /**
     * @return array{type: string, variant: string, message: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => EffectType::Toast->value,
            'variant' => $this->variant->value,
            'message' => $this->message,
        ];
    }
}
