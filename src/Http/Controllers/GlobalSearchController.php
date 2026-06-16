<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Lattice\Lattice\GlobalSearch\Contracts\SearchHistoryRecorder;
use Lattice\Lattice\GlobalSearch\Contracts\SearchResultProvider;
use Lattice\Lattice\GlobalSearch\SearchCategory;
use Lattice\Lattice\GlobalSearch\SearchPagination;
use Lattice\Lattice\GlobalSearch\SearchQuery;
use Lattice\Lattice\GlobalSearch\SearchResultProviderRegistry;
use Lattice\Lattice\GlobalSearch\SearchResults;
use Lattice\Lattice\Http\Requests\RecordSelectionRequest;
use Lattice\Lattice\Http\Requests\SearchRequest;

final readonly class GlobalSearchController
{
    public function __construct(
        private SearchResultProviderRegistry $providers,
        private SearchHistoryRecorder $history,
    ) {}

    public function search(SearchRequest $request): JsonResponse
    {
        $authorized = $this->providers->authorized($request);

        if ($request->wantsRecent()) {
            return response()->json([
                'data' => $this->history->recent($request, $request->perPage()),
                'categories' => $this->categories($request, $authorized),
                'pagination' => SearchPagination::forPage(1, $request->perPage(), 0),
                'state' => $this->state($request, null, 'recent'),
            ]);
        }

        $categories = $this->categories($request, $authorized);
        $active = $this->activeCategory($request, $categories);
        $provider = $active !== null ? ($authorized[$active] ?? null) : null;

        $results = $provider instanceof SearchResultProvider
            ? $provider->search(new SearchQuery($request->queryString(), $active, $request->page(), $request->perPage(), app()->getLocale()))
            : new SearchResults([], 0);

        return response()->json([
            'data' => $results->rows,
            'categories' => $categories,
            'pagination' => SearchPagination::forPage($request->page(), $request->perPage(), $results->total),
            'state' => $this->state($request, $active),
        ]);
    }

    public function record(RecordSelectionRequest $request): JsonResponse
    {
        /** @var string $category */
        $category = $request->validated('category');
        /** @var string $id */
        $id = $request->validated('id');

        $provider = $this->providers->forCategory($category);

        abort_if($provider === null, 404);
        abort_unless($provider->authorize($request), 403);

        $result = $provider->resolve($id, $request);
        $recorded = $result !== null && $this->history->record($request, $result);

        return response()->json([
            'data' => $result,
            'state' => ['recorded' => $recorded],
        ]);
    }

    /**
     * @param  array<string, SearchResultProvider>  $authorized
     * @return array<int, SearchCategory>
     */
    private function categories(SearchRequest $request, array $authorized): array
    {
        return array_values(array_map(function (SearchResultProvider $provider) use ($request): SearchCategory {
            $category = $provider->category();

            if (! $request->wantsCounts()) {
                return $category;
            }

            return $category->withCount($provider->count(
                new SearchQuery($request->queryString(), $category->name, 1, $request->perPage(), app()->getLocale()),
            ));
        }, $authorized));
    }

    /**
     * @param  array<int, SearchCategory>  $categories
     */
    private function activeCategory(SearchRequest $request, array $categories): ?string
    {
        $names = array_map(fn (SearchCategory $category): string => $category->name, $categories);

        $requested = $request->category();
        if ($requested !== null && in_array($requested, $names, true)) {
            return $requested;
        }

        if ($request->wantsCounts() && $categories !== []) {
            usort($categories, fn (SearchCategory $a, SearchCategory $b): int => ($b->count ?? 0) <=> ($a->count ?? 0));

            return $categories[0]->name;
        }

        return $names[0] ?? null;
    }

    /** @return array{query:string,category:?string,perPage:int,countsIncluded:bool,mode:string} */
    private function state(SearchRequest $request, ?string $active, string $mode = 'results'): array
    {
        return [
            'query' => $request->queryString(),
            'category' => $active,
            'perPage' => $request->perPage(),
            'countsIncluded' => $request->wantsCounts(),
            'mode' => $mode,
        ];
    }
}
