<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;
use JsonSerializable;
use Lattice\Lattice\Tables\Enums\PaginationType;

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
            self::serializeRows($paginator->items()),
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
            self::serializeRows($paginator->items()),
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
        $rows = self::serializeRows($items);
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
        return new self($this->data, $pagination);
    }

    /**
     * Maps each row through the callback, letting callers attach per-row
     * metadata (such as actions) to the row itself.
     *
     * @param  callable(array<string, mixed>, int): array<string, mixed>  $callback
     */
    public function decorateRows(callable $callback): self
    {
        return new self(
            array_map($callback, $this->data, array_keys($this->data)),
            $this->pagination,
        );
    }

    /**
     * @return array{data: array<int, array<string, mixed>>, pagination: array<string, mixed>, state: array<string, mixed>}
     */
    public function toArray(?TableQuery $query = null): array
    {
        return [
            'data' => $this->data,
            'pagination' => $this->pagination,
            'state' => ($query ?? TableQuery::empty())->toArray(),
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
     * @param  iterable<int, mixed>  $items
     * @return array<int, array<string, mixed>>
     */
    private static function serializeRows(iterable $items): array
    {
        return Collection::make($items)
            ->map(fn (mixed $item): array => self::serializeRow($item))
            ->values()
            ->all();
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
