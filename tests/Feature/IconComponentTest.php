<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Components\Icon;
use Lattice\Lattice\Core\Enums\Color;
use Lattice\Lattice\Core\Enums\Icon as IconName;
use Lattice\Lattice\Core\Enums\Size;

it('serializes an icon with name, size, color and class', function (): void {
    $data = wire(
        Icon::make('house')->size(Size::Lg)->color(Color::Danger)->class('opacity-80'),
    );

    expect($data['type'])->toBe('icon')
        ->and($data['props'])->toBe([
            'name' => 'house',
            'size' => 'lg',
            'color' => 'danger',
            'class' => 'opacity-80',
        ]);
});

it('resolves a backed enum name and defaults size to md', function (): void {
    $data = wire(Icon::make(IconName::Send));

    expect($data['type'])->toBe('icon')
        ->and($data['props'])->toBe([
            'name' => 'send',
            'size' => 'md',
            'color' => null,
            'class' => null,
        ]);
});
