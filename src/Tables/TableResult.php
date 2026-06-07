<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Support\Arrayable;
use JsonSerializable;

final readonly class TableResult implements JsonSerializable
{
    /**
     * @param  array<int, array<string, mixed>>  $data
     * @param  array<string, mixed>  $pagination
     */
    private function __construct(
        private array $data,
        private array $pagination = [],
    ) {}

    /**
     * @param  array<int, array<string, mixed>>  $data
     */
    public static function make(array $data): self
    {
        return new self($data);
    }

    /**
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     */
    public static function fromPaginator(LengthAwarePaginator $paginator): self
    {
        return new self(
            collect($paginator->items())
                ->map(fn (mixed $item): array => self::serializeRow($item))
                ->values()
                ->all(),
            [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $pagination
     */
    public function pagination(array $pagination): self
    {
        return new self($this->data, $pagination);
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, pagination: array<string, mixed>, state: array<string, mixed>}
     */
    public function toArray(?TableQuery $query = null): array
    {
        return [
            'data' => $this->data,
            'pagination' => $this->pagination,
            'state' => $query?->toArray() ?? [
                'filters' => [],
                'sorts' => [],
                'page' => 1,
                'perPage' => 25,
            ],
        ];
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, pagination: array<string, mixed>, state: array<string, mixed>}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    /**
     * @return array<string, mixed>
     */
    private static function serializeRow(mixed $item): array
    {
        if ($item instanceof Arrayable) {
            return $item->toArray();
        }

        return (array) $item;
    }
}
