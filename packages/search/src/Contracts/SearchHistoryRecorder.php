<?php
declare(strict_types=1);

namespace Lattice\Search\Contracts;

use Illuminate\Http\Request;
use Lattice\Search\SearchResult;

interface SearchHistoryRecorder
{
    public function record(Request $request, SearchResult $result): bool;

    /** @return list<SearchResult> */
    public function recent(Request $request, int $limit): array;
}
