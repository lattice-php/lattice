<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Icon as IconComponent;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Core\Enums\Placement;
use Lattice\Lattice\Layouts\Components\Dropdown;
use Lattice\Lattice\Layouts\Components\MenuItem;

it('builds a dropdown with trigger components, placement and menu items', function (): void {
    $dropdown = Dropdown::make('account-menu')
        ->placement(Placement::Top)
        ->trigger([
            IconComponent::make(Icon::Settings),
            Text::make('Account')->hideWhenCollapsed(),
        ])
        ->items([MenuItem::make('Profile')->href('/profile')]);

    $data = wire($dropdown);

    expect($data['type'])->toBe('dropdown')
        ->and($data['key'])->toBe('account-menu')
        ->and($data['props']['placement'])->toBe('top')
        ->and($data['props']['trigger'][0]['type'])->toBe('icon')
        ->and($data['props']['trigger'][0]['props']['name'])->toBe('settings')
        ->and($data['props']['trigger'][1]['type'])->toBe('text')
        ->and($data['props']['trigger'][1]['props']['hideWhenCollapsed'])->toBeTrue()
        ->and($data['schema'][0]['type'])->toBe('menu-item');
});
