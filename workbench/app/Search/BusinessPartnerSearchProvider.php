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
use Workbench\App\Models\BusinessPartner;

#[AsSearchProvider('business-partners')]
final class BusinessPartnerSearchProvider implements SearchResultProvider
{
    public function authorize(Request $request): bool
    {
        return true;
    }

    public function category(): SearchCategory
    {
        return new SearchCategory('business-partners', __('workbench.navigation.business-partners'), 'users');
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
            ->forPage($query->page, $query->perPage)
            ->get()
            ->map(fn (BusinessPartner $partner): SearchResult => $this->result($partner))
            ->all());

        return new SearchResults($rows, $total);
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        $partner = BusinessPartner::query()->find($id);

        return $partner instanceof BusinessPartner ? $this->result($partner) : null;
    }

    /** @return Builder<BusinessPartner> */
    private function query(string $term): Builder
    {
        return BusinessPartner::query()
            ->when($term !== '', function (Builder $builder) use ($term): void {
                $builder->where(function (Builder $query) use ($term): void {
                    $query->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->orderBy('name');
    }

    private function result(BusinessPartner $partner): SearchResult
    {
        return SearchResult::make('business-partners', new SearchResultItem(
            id: (string) $partner->getKey(),
            title: $partner->name,
            link: route('business-partners.index', ['q' => $partner->name], absolute: false),
            subtitle: $partner->email,
        ));
    }
}
