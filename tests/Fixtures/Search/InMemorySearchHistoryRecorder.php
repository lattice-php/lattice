<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Search;

use Illuminate\Http\Request;
use Lattice\Search\Contracts\SearchHistoryRecorder;
use Lattice\Search\SearchResult;

final class InMemorySearchHistoryRecorder implements SearchHistoryRecorder
{
    /** @var list<SearchResult> */
    public array $recorded = [];

    public function record(Request $request, SearchResult $result): bool
    {
        array_unshift($this->recorded, $result);

        return true;
    }

    public function recent(Request $request, int $limit): array
    {
        return array_slice($this->recorded, 0, $limit);
    }
}
