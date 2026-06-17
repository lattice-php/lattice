<?php
declare(strict_types=1);

namespace Workbench\App\Search;

use Illuminate\Http\Request;
use Lattice\Lattice\Search\Contracts\SearchHistoryRecorder;
use Lattice\Lattice\Search\SearchResult;
use Lattice\Lattice\Search\SearchResultItem;

final class SessionSearchHistoryRecorder implements SearchHistoryRecorder
{
    private const KEY = 'workbench.search.recent';

    public function record(Request $request, SearchResult $result): bool
    {
        /** @var list<array{category: array{name: string}, item: array{id: string, title: string, subtitle: string|null, additionalInfo: string|null, link: string, badge: string|null}}> $stored */
        $stored = $request->session()->get(self::KEY, []);
        $recent = collect($stored)
            ->reject(fn (array $row): bool => $row['category']['name'] === $result->category && $row['item']['id'] === $result->item->id)
            ->prepend($result->jsonSerialize())
            ->take(10)
            ->values()
            ->all();

        $request->session()->put(self::KEY, $recent);

        return true;
    }

    public function recent(Request $request, int $limit): array
    {
        /** @var list<array{category: array{name: string}, item: array{id: string, title: string, subtitle: string|null, additionalInfo: string|null, link: string, badge: string|null}}> $stored */
        $stored = $request->session()->get(self::KEY, []);

        return collect($stored)
            ->take($limit)
            ->map(fn (array $row): SearchResult => new SearchResult($row['category']['name'], new SearchResultItem(
                id: $row['item']['id'], title: $row['item']['title'], link: $row['item']['link'],
                subtitle: $row['item']['subtitle'] ?? null, additionalInfo: $row['item']['additionalInfo'] ?? null, badge: $row['item']['badge'] ?? null,
            )))
            ->all();
    }
}
