<?php
declare(strict_types=1);

namespace Workbench\App\Search;

use Illuminate\Http\Request;
use Lattice\Search\Contracts\SearchHistoryRecorder;
use Lattice\Search\SearchResult;

final class SessionSearchHistoryRecorder implements SearchHistoryRecorder
{
    private const string KEY = 'workbench.search.recent';

    public function record(Request $request, SearchResult $result): bool
    {
        $stored = $this->stored($request);
        $recent = collect($stored)
            ->reject(fn (SearchResult $storedResult): bool => $storedResult->category->name === $result->category->name && $storedResult->item->id === $result->item->id)
            ->prepend($result)
            ->take(10)
            ->values()
            ->all();

        $request->session()->put(self::KEY, $recent);

        return true;
    }

    public function recent(Request $request, int $limit): array
    {
        return array_slice($this->stored($request), 0, $limit);
    }

    /** @return list<SearchResult> */
    private function stored(Request $request): array
    {
        $stored = $request->session()->get(self::KEY, []);

        return is_array($stored)
            ? array_values(array_filter($stored, fn (mixed $result): bool => $result instanceof SearchResult))
            : [];
    }
}
