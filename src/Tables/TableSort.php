<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

final readonly class TableSort
{
    public function __construct(public string $key, public string $direction) {}

    public static function fromString(string $sort): self
    {
        if (str_starts_with($sort, '-')) {
            return new self(substr($sort, 1), 'desc');
        }

        return new self($sort, 'asc');
    }

    /**
     * @return array{key: string, direction: string}
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'direction' => $this->direction,
        ];
    }
}
