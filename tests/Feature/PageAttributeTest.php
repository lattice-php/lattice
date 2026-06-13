<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;

test('page attribute stores route metadata', function () {
    $attribute = new Page(
        route: '/products/{product}/edit',
        name: 'products.edit',
        layout: PageLayout::App,
        container: PageContainer::Default,
        middleware: ['can:manage'],
    );

    expect($attribute->route)->toBe('/products/{product}/edit')
        ->and($attribute->name)->toBe('products.edit')
        ->and($attribute->layout)->toBe(PageLayout::App)
        ->and($attribute->container)->toBe(PageContainer::Default)
        ->and($attribute->middleware)->toBe(['can:manage']);
});

test('page attribute defaults every argument to null', function () {
    $attribute = new Page;

    expect($attribute->route)->toBeNull()
        ->and($attribute->name)->toBeNull()
        ->and($attribute->layout)->toBeNull()
        ->and($attribute->container)->toBeNull()
        ->and($attribute->middleware)->toBeNull();
});
