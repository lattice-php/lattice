<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;
use Spatie\TypeScriptTransformer\Attributes\Optional;

final readonly class ResetFormEffect implements Effect
{
    public function __construct(
        #[Optional]
        public ?string $form = null,
    ) {}

    /**
     * @return array{type: string, form?: string}
     */
    public function jsonSerialize(): array
    {
        return array_filter([
            'type' => EffectType::ResetForm->value,
            'form' => $this->form,
        ], fn (mixed $value): bool => $value !== null);
    }
}
