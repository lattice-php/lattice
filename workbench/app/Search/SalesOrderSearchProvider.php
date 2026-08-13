<?php
declare(strict_types=1);

namespace Workbench\App\Search;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Lattice\Search\AsSearchProvider;
use Lattice\Search\Contracts\SearchResultProvider;
use Lattice\Search\SearchCategory;
use Lattice\Search\SearchQuery;
use Lattice\Search\SearchResult;
use Lattice\Search\SearchResultItem;
use Lattice\Search\SearchResults;
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
        return new SearchCategory('sales-orders', __('workbench.navigation.sales-orders'), 'receipt');
    }

    public function count(SearchQuery $query): int
    {
        return $this->query($query->query)->count();
    }

    public function search(SearchQuery $query): SearchResults
    {
        $builder = $this->query($query->query);
        $total = $builder->count();
        $rows = array_values($builder
            ->with('businessPartner')
            ->forPage($query->page, $query->perPage)
            ->get()
            ->map(fn (SalesOrder $order): SearchResult => $this->result($order))
            ->all());

        return new SearchResults($rows, $total);
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        $order = SalesOrder::query()->with('businessPartner')->find($id);

        return $order instanceof SalesOrder ? $this->result($order) : null;
    }

    /** @return Builder<SalesOrder> */
    private function query(string $term): Builder
    {
        return SalesOrder::query()
            ->when($term !== '', fn (Builder $builder): Builder => $builder->where('number', 'like', "%{$term}%"))
            ->orderByDesc('id');
    }

    private function result(SalesOrder $order): SearchResult
    {
        return SearchResult::make('sales-orders', new SearchResultItem(
            id: (string) $order->getKey(),
            title: $order->number,
            link: route('sales-orders.index', ['q' => $order->number], absolute: false),
            subtitle: $order->businessPartner?->name,
            badge: $order->status->value,
        ));
    }
}
