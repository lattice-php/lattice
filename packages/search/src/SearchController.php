<?php
declare(strict_types=1);

namespace Lattice\Search;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Search\Contracts\SearchHistoryRecorder;
use Lattice\Search\Contracts\SearchResultProvider;
use Lattice\Search\Enums\SearchMode;

final readonly class SearchController
{
    public function __construct(
        private SearchProviderRegistry $providers,
        private SearchHistoryRecorder $history,
    ) {}

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'counts' => ['nullable', 'boolean'],
            'recent' => ['nullable', 'boolean'],
        ]);

        $query = trim((string) ($validated['query'] ?? ''));
        $page = (int) ($validated['page'] ?? 1);
        $perPage = (int) ($validated['per_page'] ?? 20);
        $countsIncluded = $request->boolean('counts');
        $authorized = $this->providers->authorized($request);

        if ($request->boolean('recent')) {
            $recent = array_values(array_filter(
                $this->history->recent($request, $perPage),
                fn (SearchResult $result): bool => isset($authorized[$result->category->name]),
            ));

            return response()->json(new SearchResponse(
                data: $recent,
                categories: $this->categories($authorized, $query, $perPage, $countsIncluded),
                pagination: SearchPagination::forPage(1, $perPage, count($recent)),
                state: new SearchState($query, null, $perPage, $countsIncluded, SearchMode::Recent),
            ));
        }

        $categories = $this->categories($authorized, $query, $perPage, $countsIncluded);
        $requestedCategory = $validated['category'] ?? null;
        $activeCategory = $this->activeCategory(
            is_string($requestedCategory) && $requestedCategory !== '' ? $requestedCategory : null,
            $categories,
            $countsIncluded,
        );
        $provider = $activeCategory !== null ? ($authorized[$activeCategory] ?? null) : null;
        $results = $provider instanceof SearchResultProvider
            ? $provider->search($this->query($query, $activeCategory, $page, $perPage))
            : new SearchResults([], 0);

        return response()->json(new SearchResponse(
            data: $results->rows,
            categories: $categories,
            pagination: SearchPagination::forPage($page, $perPage, $results->total),
            state: new SearchState($query, $activeCategory, $perPage, $countsIncluded, SearchMode::Results),
        ));
    }

    public function record(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:255'],
            'id' => ['required', 'string', 'max:255'],
        ]);

        $category = (string) $validated['category'];
        $provider = $this->providers->forCategory($category);

        abort_if(! $provider instanceof SearchResultProvider, 404);
        abort_unless($provider->authorize($request), 403);

        $result = $provider->resolve((string) $validated['id'], $request);

        abort_if(! $result instanceof SearchResult, 404);

        return response()->json(new RecordSelectionResponse(
            data: $result,
            state: new RecordSelectionState($this->history->record($request, $result)),
        ));
    }

    /**
     * @param  array<string, SearchResultProvider>  $providers
     * @return list<SearchCategory>
     */
    private function categories(array $providers, string $query, int $perPage, bool $countsIncluded): array
    {
        return array_values(array_map(function (SearchResultProvider $provider) use ($query, $perPage, $countsIncluded): SearchCategory {
            $category = $provider->category();

            return $countsIncluded
                ? $category->withCount($provider->count($this->query($query, $category->name, 1, $perPage)))
                : $category;
        }, $providers));
    }

    /** @param list<SearchCategory> $categories */
    private function activeCategory(?string $requested, array $categories, bool $countsIncluded): ?string
    {
        foreach ($categories as $category) {
            if ($category->name === $requested) {
                return $category->name;
            }
        }

        $active = $categories[0] ?? null;

        if ($countsIncluded) {
            foreach ($categories as $category) {
                if (($category->count ?? 0) > ($active->count ?? 0)) {
                    $active = $category;
                }
            }
        }

        return $active?->name;
    }

    private function query(string $query, ?string $category, int $page, int $perPage): SearchQuery
    {
        return new SearchQuery($query, $category, $page, $perPage, app()->getLocale());
    }
}
