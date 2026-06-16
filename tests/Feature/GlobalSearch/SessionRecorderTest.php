<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use Lattice\Lattice\GlobalSearch\SearchResult;
use Lattice\Lattice\GlobalSearch\SearchResultItem;
use Workbench\App\Search\SessionSearchHistoryRecorder;

function sessionRecorderRequest(): Request
{
    $request = Request::create('/');
    $request->setLaravelSession(new Store('test', new ArraySessionHandler(120)));

    return $request;
}

test('records a selection and reads it back', function () {
    $request = sessionRecorderRequest();
    $recorder = new SessionSearchHistoryRecorder;
    $result = new SearchResult('products', new SearchResultItem(id: '1', title: 'Widget', link: '/products/1'));

    expect($recorder->record($request, $result))->toBeTrue();

    $recent = $recorder->recent($request, 10);
    expect($recent)->toHaveCount(1);
    expect($recent[0]->item->id)->toBe('1')
        ->and($recent[0]->category)->toBe('products');
});

test('recording the same selection twice dedupes to one entry', function () {
    $request = sessionRecorderRequest();
    $recorder = new SessionSearchHistoryRecorder;
    $result = new SearchResult('products', new SearchResultItem(id: '1', title: 'Widget', link: '/products/1'));

    $recorder->record($request, $result);
    $recorder->record($request, $result);

    expect($recorder->recent($request, 10))->toHaveCount(1);
});
