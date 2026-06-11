<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;

final class MenuProductsPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Products'));
    }
}

test('a menu serializes its items as a menu node tree', function () {
    $menu = Menu::make('main')->items([
        MenuItem::make('Home')->href('/'),
        MenuItem::make('Account')->items([
            MenuItem::make('Profile')->href('/profile'),
        ]),
    ]);

    $wire = wire($menu);

    expect($wire['type'])->toBe('menu')
        ->and($wire['key'])->toBe('main')
        ->and($wire['schema'][0]['type'])->toBe('menu-item')
        ->and($wire['schema'][0]['props'])->toMatchArray(['label' => 'Home', 'href' => '/'])
        ->and($wire['schema'][1]['props'])->toMatchArray(['label' => 'Account'])
        ->and($wire['schema'][1]['schema'][0]['props'])->toMatchArray([
            'label' => 'Profile',
            'href' => '/profile',
        ]);
});

test('a menu item serializes its icon and method', function () {
    $wire = wire(
        MenuItem::make('Log out')->href('/logout')->icon('log-out')->method(HttpMethod::Post),
    );

    expect($wire['type'])->toBe('menu-item')
        ->and($wire['props'])->toMatchArray([
            'label' => 'Log out',
            'href' => '/logout',
            'icon' => 'log-out',
            'method' => 'post',
        ]);
});

test('a menu item omits unset optional props from the wire', function () {
    $wire = wire(MenuItem::make('Home')->href('/'));

    expect($wire['props'])->not->toHaveKey('method')
        ->and($wire['props'])->not->toHaveKey('icon');
});

test('fromPage resolves the href and a default label from the page route', function () {
    Route::latticePage('/menu-products', MenuProductsPage::class);

    $wire = wire(MenuItem::fromPage(MenuProductsPage::class));

    expect($wire['props'])->toMatchArray([
        'label' => 'Menu Products',
        'href' => '/menu-products',
    ]);
});

test('fromPage substitutes route parameters into the href', function () {
    Route::latticePage('/menu-products/{product}', MenuProductsPage::class);

    $wire = wire(MenuItem::fromPage(MenuProductsPage::class, ['product' => 7]));

    expect($wire['props']['href'])->toBe('/menu-products/7');
});

test('fromPage label can be overridden fluently', function () {
    Route::latticePage('/menu-products', MenuProductsPage::class);

    $wire = wire(MenuItem::fromPage(MenuProductsPage::class)->label('Catalog'));

    expect($wire['props']['label'])->toBe('Catalog');
});

test('fromPage rejects a class that is not a lattice page', function () {
    expect(fn () => MenuItem::fromPage(stdClass::class))
        ->toThrow(InvalidArgumentException::class);
});

test('fromPage rejects a page without a registered route', function () {
    expect(fn () => MenuItem::fromPage(MenuProductsPage::class))
        ->toThrow(InvalidArgumentException::class);
});
