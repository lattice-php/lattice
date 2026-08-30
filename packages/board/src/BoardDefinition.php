<?php
declare(strict_types=1);

namespace Lattice\Board;

use Lattice\Board\Contracts\BoardSource;
use Lattice\Core\Definition;
use Lattice\Table\Filters\Filter;
use Lattice\Ui\Components\Component;

/**
 * A registered, addressable board: the server-side counterpart of
 * `Board::use()`. The registry key from {@see AsBoard} lets the endpoint
 * re-resolve the definition on a later request, with the sealed context
 * re-applied by the controller.
 */
abstract class BoardDefinition extends Definition
{
    /**
     * @return list<BoardColumn>
     */
    abstract public function columns(): array;

    abstract public function source(): BoardSource;

    /**
     * The single card template, serialized once and materialized per card by
     * the client through its data bindings.
     *
     * @return list<Component>
     */
    abstract public function card(): array;

    public function perColumn(): int
    {
        return 25;
    }

    /**
     * Opts the board into restoring its query (search, table filters) from
     * the page request's URL on initial render, and writing client-side query
     * changes back to the URL. Off by default.
     */
    public function syncsQueryToUrl(): bool
    {
        return false;
    }

    /**
     * Nests the synced query under a bracketed key (`tasks[q]`, …) instead of
     * the unprefixed params, so more than one synced component can share a
     * page. Null keeps the params unprefixed.
     */
    public function urlQueryKey(): ?string
    {
        return null;
    }

    /**
     * @return list<string>
     */
    public function searchable(): array
    {
        return [];
    }

    /**
     * Dedicated, table-level filter classes rendered in the board toolbar.
     *
     * @return list<Filter>
     */
    public function filters(): array
    {
        return [];
    }

    /**
     * @param  array<string, mixed>  $card
     * @return array<string, mixed>
     */
    public function cardData(array $card): array
    {
        return $card;
    }

    public function emptyColumnLabel(): ?string
    {
        return null;
    }

    /**
     * @param  array<string, mixed>  $card
     */
    public function cardUrl(array $card): ?string
    {
        return null;
    }

    /**
     * @param  array<string, mixed>  $card
     * @return array<int, Component>
     */
    public function cardActions(array $card): array
    {
        return [];
    }
}
