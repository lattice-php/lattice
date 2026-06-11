<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Actions\Enums\EffectType;

final readonly class RedirectEffect implements Effect
{
    public function __construct(
        public string $url,
    ) {}

    /**
     * @return array{type: string, url: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => EffectType::Redirect->value,
            'url' => $this->url,
        ];
    }
}
