<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Layouts\Components\Menu;
use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Support\Affix;

final class MenuProductsPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Products'));
    }
}

test('a menu serializes its items as a menu node tree', function (): void {
    $menu = Menu::make('main')->items([
        MenuItem::make('Home')->href('/'),
        MenuItem::make('Account')->children([
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

test('a menu item nests children that pipe to its schema', function (): void {
    $wire = wire(
        MenuItem::make('Account')->children([
            MenuItem::make('Profile')->href('/profile'),
        ]),
    );

    expect($wire['schema'][0]['type'])->toBe('menu-item')
        ->and($wire['schema'][0]['props'])->toMatchArray([
            'label' => 'Profile',
            'href' => '/profile',
        ]);
});

test('a menu item serializes its icon and method', function (): void {
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

test('a menu item includes unset optional props as null on the wire', function (): void {
    $wire = wire(MenuItem::make('Home')->href('/'));

    expect($wire['props']['method'])->toBeNull()
        ->and($wire['props']['icon'])->toBeNull()
        ->and($wire['props']['prefix'])->toBeNull()
        ->and($wire['props']['suffix'])->toBeNull();
});

test('a menu item serializes prefix and suffix affixes', function (): void {
    $wire = wire(
        MenuItem::make('Tables')->href('/tables')->prefix(Icon::Table)->suffix('beta'),
    );

    expect($wire['props']['prefix'])->toBe(['icon' => 'table', 'text' => null])
        ->and($wire['props']['suffix'])->toBe(['icon' => null, 'text' => 'beta']);
});

test('a menu item prefix takes an icon by name via the affix escape hatch', function (): void {
    $wire = wire(MenuItem::make('Home')->href('/')->prefix(Affix::icon('house')));

    expect($wire['props']['prefix'])->toBe(['icon' => 'house', 'text' => null]);
});

test('icon serializes as a string prop on a menu item', function (): void {
    $wire = wire(MenuItem::make('Settings')->href('/settings')->icon(Icon::Settings));

    expect($wire['props']['icon'])->toBe('settings');
});

test('fromPage resolves the href and a default label from the page route', function (): void {
    Route::get('/menu-products', [MenuProductsPage::class, 'render']);

    $wire = wire(MenuItem::fromPage(MenuProductsPage::class));

    expect($wire['props'])->toMatchArray([
        'label' => 'Menu Products',
        'href' => '/menu-products',
    ]);
});

test('fromPage substitutes route parameters into the href', function (): void {
    Route::get('/menu-products/{product}', [MenuProductsPage::class, 'render']);

    $wire = wire(MenuItem::fromPage(MenuProductsPage::class, ['product' => 7]));

    expect($wire['props']['href'])->toBe('/menu-products/7');
});

test('fromPage label can be overridden fluently', function (): void {
    Route::get('/menu-products', [MenuProductsPage::class, 'render']);

    $wire = wire(MenuItem::fromPage(MenuProductsPage::class)->label('Catalog'));

    expect($wire['props']['label'])->toBe('Catalog');
});

test('fromPage rejects a class that is not a lattice page', function (): void {
    expect(fn (): MenuItem => MenuItem::fromPage(stdClass::class))
        ->toThrow(InvalidArgumentException::class);
});

test('fromPage rejects a page without a registered route', function (): void {
    expect(fn (): MenuItem => MenuItem::fromPage(MenuProductsPage::class))
        ->toThrow(InvalidArgumentException::class);
});

test('a link menu item cannot be given children', function (): void {
    expect(fn (): MenuItem => MenuItem::make('Account')->href('/account')->children([
        MenuItem::make('Profile')->href('/profile'),
    ]))->toThrow(InvalidArgumentException::class);
});

test('a menu item with children cannot become a link', function (): void {
    expect(fn (): MenuItem => MenuItem::make('Account')->children([
        MenuItem::make('Profile')->href('/profile'),
    ])->href('/account'))->toThrow(InvalidArgumentException::class);
});
