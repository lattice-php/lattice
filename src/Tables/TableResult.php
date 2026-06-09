<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Tables\Enums\PaginationType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;
use JsonSerializable;

final readonly class TableResult implements JsonSerializable
{
    /**
     * @param  array<int, array<string, mixed>>  $data
     * @param  array<string, mixed>  $pagination
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function __construct(
        private array $data,
        private array $pagination = [],
        private array $rows = [],
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
                'mode' => PaginationType::Table->value,
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'hasMore' => $paginator->hasMorePages(),
                'nextPage' => $paginator->hasMorePages() ? $paginator->currentPage() + 1 : null,
            ],
        );
    }

    /**
     * @param  Paginator<int, mixed>  $paginator
     */
    public static function fromSimplePaginator(
        Paginator $paginator,
        PaginationType $type = PaginationType::Infinite,
    ): self {
        return new self(
            collect($paginator->items())
                ->map(fn (mixed $item): array => self::serializeRow($item))
                ->values()
                ->all(),
            [
                'mode' => $type->value,
                'currentPage' => $paginator->currentPage(),
                'perPage' => $paginator->perPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'hasMore' => $paginator->hasMorePages(),
                'nextPage' => $paginator->hasMorePages() ? $paginator->currentPage() + 1 : null,
            ],
        );
    }

    /**
     * @param  iterable<int, mixed>  $items
     */
    public static function fromItems(iterable $items, PaginationType $type = PaginationType::None): self
    {
        $rows = Collection::make($items)
            ->map(fn (mixed $item): array => self::serializeRow($item))
            ->values()
            ->all();
        $total = count($rows);

        return new self(
            $rows,
            [
                'mode' => $type->value,
                'total' => $total,
                'from' => $total > 0 ? 1 : 0,
                'to' => $total,
                'hasMore' => false,
                'nextPage' => null,
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $pagination
     */
    public function pagination(array $pagination): self
    {
        return new self($this->data, $pagination, $this->rows);
    }

    /**
     * @param  callable(array<string, mixed>, int): array<string, mixed>  $callback
     */
    public function rows(callable $callback): self
    {
        $rows = collect($this->data)
            ->map(fn (array $row, int $index): array => $callback($row, $index))
            ->filter(fn (array $row): bool => $row !== [])
            ->values()
            ->all();

        return new self(
            $this->data,
            $this->pagination,
            $rows,
        );
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, pagination: array<string, mixed>, rows?: array<int, array<string, mixed>>, state: array<string, mixed>}
     */
    public function toArray(?TableQuery $query = null): array
    {
        $payload = [
            'data' => $this->data,
            'pagination' => $this->pagination,
            'rows' => $this->rows,
            'state' => $query?->toArray() ?? [
                'filters' => [],
                'sorts' => [],
                'page' => 1,
                'perPage' => 25,
            ],
        ];

        if ($this->rows === []) {
            unset($payload['rows']);
        }

        return $payload;
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, pagination: array<string, mixed>, rows?: array<int, array<string, mixed>>, state: array<string, mixed>}
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
