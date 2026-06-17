<?php
declare(strict_types=1);

use Lattice\Lattice\Search\SearchCategory;
use Lattice\Lattice\Search\SearchPagination;
use Lattice\Lattice\Search\SearchResult;
use Lattice\Lattice\Search\SearchResultItem;

test('a result serializes to the category/item envelope', function () {
    $result = new SearchResult('products', new SearchResultItem(
        id: '42', title: 'Widget X', link: '/products/42',
        subtitle: 'SKU-42', additionalInfo: '€19.99', badge: 'new',
    ));

    expect($result->jsonSerialize())->toBe([
        'category' => ['name' => 'products'],
        'item' => [
            'id' => '42', 'title' => 'Widget X', 'subtitle' => 'SKU-42',
            'additionalInfo' => '€19.99', 'link' => '/products/42', 'badge' => 'new',
        ],
    ]);
});

test('category count is null until stamped', function () {
    $category = new SearchCategory('products', 'Products', 'package');
    expect($category->jsonSerialize()['count'])->toBeNull();
    expect($category->withCount(96)->jsonSerialize())->toBe([
        'name' => 'products', 'label' => 'Products', 'icon' => 'package', 'count' => 96,
    ]);
});

test('pagination reports the next page when more remain', function () {
    expect((new SearchPagination(1, 20, 96, true, 2))->jsonSerialize())->toBe([
        'page' => 1, 'perPage' => 20, 'total' => 96, 'hasMore' => true, 'nextPage' => 2,
    ]);
});

test('SearchPagination::forPage calculates pagination with items remaining', function () {
    $pagination = SearchPagination::forPage(1, 20, 96);
    expect($pagination->jsonSerialize())->toBe([
        'page' => 1, 'perPage' => 20, 'total' => 96, 'hasMore' => true, 'nextPage' => 2,
    ]);
});

test('SearchPagination::forPage handles exact last page boundary', function () {
    $pagination = SearchPagination::forPage(5, 20, 100);
    expect($pagination->jsonSerialize())->toBe([
        'page' => 5, 'perPage' => 20, 'total' => 100, 'hasMore' => false, 'nextPage' => null,
    ]);
});
