<?php
declare(strict_types=1);

namespace Lattice\Lattice\GlobalSearch;

use Illuminate\Http\Request;
use Lattice\Lattice\GlobalSearch\Contracts\SearchHistoryRecorder;

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
