<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;
use Spatie\TypeScriptTransformer\Attributes\Optional;

final readonly class CloseModalEffect implements Effect
{
    public function __construct(
        #[Optional]
        public ?string $modal = null,
    ) {}

    /**
     * @return array{type: string, modal?: string}
     */
    public function jsonSerialize(): array
    {
        return array_filter([
            'type' => EffectType::CloseModal->value,
            'modal' => $this->modal,
        ], fn (mixed $value): bool => $value !== null);
    }
}
