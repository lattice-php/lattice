<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Search\NullSearchHistoryRecorder;
use Lattice\Lattice\Search\SearchResult;
use Lattice\Lattice\Search\SearchResultItem;

test('the null recorder persists nothing', function () {
    $recorder = new NullSearchHistoryRecorder;
    $result = new SearchResult('products', new SearchResultItem('1', 'X', '/x'));

    expect($recorder->record(new Request, $result))->toBeFalse();
    expect($recorder->recent(new Request, 10))->toBe([]);
});
