<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Text;

it('marks a bound component with the field it displays', function (): void {
    $wire = Wire::toArray(Text::make('Welcome')->bind('title'));

    expect($wire['props']['binding'])->toBe('title')
        ->and($wire['props']['text'])->toBe('Welcome');
});

it('leaves unbound components without a binding prop', function (): void {
    expect(Wire::toArray(Heading::make('Welcome'))['props'])->not->toHaveKey('binding')
        ->and(Wire::toArray(Button::make('Go')->href('/go'))['props'])->not->toHaveKey('binding');
});

it('binds any component, including triggers and containers', function (): void {
    expect(Wire::toArray(Button::make('Go')->bind('label'))['props']['binding'])->toBe('label')
        ->and(Button::make('Go')->bind('label')->boundField())->toBe('label');
});
