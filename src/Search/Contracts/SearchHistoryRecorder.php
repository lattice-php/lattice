<?php
declare(strict_types=1);

namespace Lattice\Lattice\Search\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Search\SearchResult;

interface SearchHistoryRecorder
{
    /** Record a selected result. Returns true if it was persisted. */
    public function record(Request $request, SearchResult $result): bool;

    /** @return array<int, SearchResult> */
    public function recent(Request $request, int $limit): array;
}
