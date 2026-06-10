<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use JsonSerializable;
use Lattice\Lattice\Tables\Enums\SortDirection;

final readonly class TableSort implements JsonSerializable
{
    public function __construct(public string $key, public SortDirection $direction) {}

    public static function fromString(string $sort): self
    {
        if (str_starts_with($sort, '-')) {
            return new self(substr($sort, 1), SortDirection::Desc);
        }

        return new self($sort, SortDirection::Asc);
    }

    /**
     * @return array{key: string, direction: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'key' => $this->key,
            'direction' => $this->direction->value,
        ];
    }
}
