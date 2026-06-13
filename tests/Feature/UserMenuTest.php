<?php
declare(strict_types=1);

use Lattice\Lattice\Layouts\Components\MenuItem;
use Lattice\Lattice\Layouts\Components\UserMenu;

it('builds a user menu with identity and items', function () {
    $node = wire(
        UserMenu::make()
            ->name('Ada Lovelace')
            ->email('ada@example.com')
            ->avatar('https://example.com/a.png')
            ->items([MenuItem::make('Log out')->href('/logout')])
    );

    expect($node['type'])->toBe('user-menu')
        ->and($node['props']['name'])->toBe('Ada Lovelace')
        ->and($node['props']['email'])->toBe('ada@example.com')
        ->and($node['props']['avatar'])->toBe('https://example.com/a.png')
        ->and($node['schema'][0]['type'])->toBe('menu-item');
});
