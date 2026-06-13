<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Color;
use Lattice\Lattice\Core\Enums\Size;

it('serializes text size and color styling', function (): void {
    $data = wire(
        Text::make('Manuel Christlieb')
            ->align(Align::Center)
            ->size(Size::Sm)
            ->color(Color::Default),
    );

    expect($data['type'])->toBe('text')
        ->and($data['props'])->toBe([
            'text' => 'Manuel Christlieb',
            'align' => 'center',
            'size' => 'sm',
            'color' => 'default',
        ]);
});
