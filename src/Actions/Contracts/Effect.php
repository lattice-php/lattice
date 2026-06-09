<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions\Contracts;

use JsonSerializable;

interface Effect extends JsonSerializable
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(): array;
}
