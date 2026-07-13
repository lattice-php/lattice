<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Tables\Enums\PaginationType;

#[TypeScript]
final readonly class TableResult
{
    public TableQuery $query;

    /**
     * @param  array<int, array<string, mixed>>  $data
     */
    private function __construct(
        public array $data,
        public ?TablePagination $pagination = null,
        ?TableQuery $query = null,
    ) {
        $this->query = $query ?? TableQuery::empty();
    }

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
            new TablePagination(
                mode: PaginationType::Table,
                currentPage: $paginator->currentPage(),
                lastPage: $paginator->lastPage(),
                perPage: $paginator->perPage(),
                total: $paginator->total(),
                from: $paginator->firstItem(),
                to: $paginator->lastItem(),
                hasMore: $paginator->hasMorePages(),
                nextPage: $paginator->hasMorePages() ? $paginator->currentPage() + 1 : null,
            ),
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
            new TablePagination(
                mode: $type,
                currentPage: $paginator->currentPage(),
                perPage: $paginator->perPage(),
                from: $paginator->firstItem(),
                to: $paginator->lastItem(),
                hasMore: $paginator->hasMorePages(),
                nextPage: $paginator->hasMorePages() ? $paginator->currentPage() + 1 : null,
            ),
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
            new TablePagination(
                mode: $type,
                total: $total,
                from: $total > 0 ? 1 : 0,
                to: $total,
                hasMore: false,
            ),
        );
    }

    public function pagination(TablePagination $pagination): self
    {
        return new self($this->data, $pagination, $this->query);
    }

    public function forQuery(TableQuery $query): self
    {
        return new self($this->data, $this->pagination, $query);
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
            $this->query,
        );
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
