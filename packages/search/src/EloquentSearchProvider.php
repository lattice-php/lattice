<?php
declare(strict_types=1);

namespace Lattice\Search;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Lattice\Core\Concerns\AuthorizesByDeclaration;
use Lattice\Core\Contracts\ResolvesGateSubject;
use Lattice\Search\Contracts\SearchResultProvider;

/**
 * A category backed by an Eloquent model: supply the base query, the columns a
 * term matches against, and how a record becomes a result. Counting, paging
 * and re-resolving a recorded selection are the same for every such provider
 * and live here.
 *
 * The gate is the `can`/`on` on the provider's attribute. Override
 * {@see authorize()} only to narrow it further; a provider needing a gate
 * subject implements {@see ResolvesGateSubject}.
 *
 * @template TModel of Model
 */
abstract class EloquentSearchProvider implements SearchResultProvider
{
    use AuthorizesByDeclaration;

    /**
     * The base query: scopes, ordering, and the eager loads {@see result()}
     * reads. Called per request, never memoized.
     *
     * @return Builder<TModel>
     */
    abstract protected function query(): Builder;

    /**
     * Columns a term matches against, as qualified or plain column names.
     *
     * @return list<string>
     */
    abstract protected function searchColumns(): array;

    /**
     * @param  TModel  $model
     */
    abstract protected function result(Model $model): SearchResult;

    public function count(SearchQuery $query): int
    {
        return $this->matching($query->query)->count();
    }

    public function search(SearchQuery $query): SearchResults
    {
        $page = $this->matching($query->query)->paginate($query->perPage, page: $query->page);

        return new SearchResults(
            rows: array_values(array_map($this->result(...), $page->items())),
            total: $page->total(),
        );
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        $model = $this->query()->find($id);

        return $model === null ? null : $this->result($model);
    }

    /**
     * An empty term matches everything, which is what the palette shows before
     * anything is typed.
     *
     * @return Builder<TModel>
     */
    protected function matching(string $term): Builder
    {
        $builder = $this->query();
        $columns = $this->searchColumns();

        if ($term === '' || $columns === []) {
            return $builder;
        }

        // Escaped the way Table's FilterApplier escapes a Contains filter, so
        // a typed wildcard matches literally on a driver that honours it.
        $pattern = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $term).'%';

        return $builder->where(function (Builder $group) use ($columns, $pattern): void {
            foreach ($columns as $column) {
                $group->orWhere($column, 'like', $pattern);
            }
        });
    }
}
