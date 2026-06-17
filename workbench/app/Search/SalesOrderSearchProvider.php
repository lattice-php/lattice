<?php
declare(strict_types=1);

namespace Workbench\App\Search;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsSearchProvider;
use Lattice\Lattice\Search\Contracts\SearchResultProvider;
use Lattice\Lattice\Search\SearchCategory;
use Lattice\Lattice\Search\SearchQuery;
use Lattice\Lattice\Search\SearchResult;
use Lattice\Lattice\Search\SearchResultItem;
use Lattice\Lattice\Search\SearchResults;
use Workbench\App\Models\SalesOrder;

#[AsSearchProvider('sales-orders')]
final class SalesOrderSearchProvider implements SearchResultProvider
{
    public function authorize(Request $request): bool
    {
        return true;
    }

    public function category(): SearchCategory
    {
        return new SearchCategory('sales-orders', __('workbench.search.sales-orders'), 'receipt');
    }

    public function count(SearchQuery $query): int
    {
        return $this->query($query->query)->count();
    }

    public function search(SearchQuery $query): SearchResults
    {
        $builder = $this->query($query->query);
        $total = $builder->count();

        $rows = $builder
            ->with('businessPartner')
            ->forPage($query->page, $query->perPage)
            ->get()
            ->map(fn (SalesOrder $order): SearchResult => $this->toResult($order))
            ->all();

        return new SearchResults($rows, $total);
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        $order = SalesOrder::query()->with('businessPartner')->find($id);

        return $order === null ? null : $this->toResult($order);
    }

    /** @return Builder<SalesOrder> */
    private function query(string $term): Builder
    {
        return SalesOrder::query()
            ->when($term !== '', fn (Builder $builder) => $builder->where('number', 'like', "%{$term}%"))
            ->orderByDesc('id');
    }

    private function toResult(SalesOrder $order): SearchResult
    {
        return new SearchResult('sales-orders', new SearchResultItem(
            id: (string) $order->getKey(),
            title: $order->number,
            link: '/sales-orders/'.$order->getKey(),
            subtitle: $order->businessPartner?->name,
            badge: $order->status->value,
        ));
    }
}
