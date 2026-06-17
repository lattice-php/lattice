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
        return new SearchCategory('business-partners', __('workbench.global-search.business-partners'), 'users');
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
            ->forPage($query->page, $query->perPage)
            ->get()
            ->map(fn (BusinessPartner $partner): SearchResult => $this->toResult($partner))
            ->all();

        return new SearchResults($rows, $total);
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        $partner = BusinessPartner::query()->find($id);

        return $partner === null ? null : $this->toResult($partner);
    }

    /** @return Builder<BusinessPartner> */
    private function query(string $term): Builder
    {
        return BusinessPartner::query()
            ->when($term !== '', function (Builder $builder) use ($term): void {
                $builder->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%");
            })
            ->orderBy('name');
    }

    private function toResult(BusinessPartner $partner): SearchResult
    {
        return new SearchResult('business-partners', new SearchResultItem(
            id: (string) $partner->getKey(),
            title: $partner->name,
            link: '/business-partners/'.$partner->getKey(),
            subtitle: $partner->email,
        ));
    }
}
