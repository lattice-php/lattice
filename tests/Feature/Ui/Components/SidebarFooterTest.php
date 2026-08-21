<?php
declare(strict_types=1);

use Lattice\Ui\Components\Menu;
use Lattice\Ui\Components\MenuItem;
use Lattice\Ui\Components\Sidebar;
use Lattice\Ui\Components\Text;

test('a sidebar serializes footer components in a trailing footer node', function (): void {
    $sidebar = Sidebar::make('app-sidebar')
        ->items([
            Menu::make('main')->items([MenuItem::make('Home')->href('/')]),
        ])
        ->footer([
            Text::make('Tenant switcher'),
        ]);

    $wire = wire($sidebar);

    expect($wire['type'])->toBe('sidebar')
        ->and($wire['schema'][0]['type'])->toBe('menu')
        ->and($wire['schema'][1]['type'])->toBe('sidebar.footer')
        ->and($wire['schema'][1]['schema'][0]['type'])->toBe('text');
});

test('sidebar footer components serialize regardless of call order', function (): void {
    $sidebar = Sidebar::make('app-sidebar')
        ->footer([Text::make('Tenant switcher')])
        ->items([
            Menu::make('main')->items([MenuItem::make('Home')->href('/')]),
        ]);

    $wire = wire($sidebar);

    expect($wire['schema'][0]['type'])->toBe('menu')
        ->and($wire['schema'][1]['type'])->toBe('sidebar.footer');
});

test('a sidebar without a footer serializes no footer node', function (): void {
    $wire = wire(Sidebar::make('app-sidebar')->items([
        Menu::make('main')->items([MenuItem::make('Home')->href('/')]),
    ]));

    expect($wire['schema'])->toHaveCount(1)
        ->and($wire['schema'][0]['type'])->toBe('menu');
});
