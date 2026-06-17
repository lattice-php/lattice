<?php
declare(strict_types=1);

namespace Lattice\Lattice\Search;

use Illuminate\Http\Request;
use Lattice\Lattice\Search\Contracts\SearchHistoryRecorder;

final class NullSearchHistoryRecorder implements SearchHistoryRecorder
{
    public function record(Request $request, SearchResult $result): bool
    {
        return false;
    }

    public function recent(Request $request, int $limit): array
    {
        return [];
    }
}
