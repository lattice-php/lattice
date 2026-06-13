<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Layouts\Components\Dropdown;
use Lattice\Lattice\Layouts\Components\MenuItem;

it('builds a dropdown with a label, icon and menu items', function () {
    $dropdown = Dropdown::make('Account')
        ->icon(Icon::Settings)
        ->items([MenuItem::make('Profile')->href('/profile')]);

    $data = wire($dropdown);

    expect($data['type'])->toBe('dropdown')
        ->and($data['props']['label'])->toBe('Account')
        ->and($data['props']['icon'])->toBe('settings')
        ->and($data['schema'][0]['type'])->toBe('menu-item');
});
