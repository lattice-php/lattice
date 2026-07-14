<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\ColorPicker;
use Lattice\Lattice\Support\Wire;

it('serializes with the default palette', function (): void {
    $node = wire(ColorPicker::make('color', 'Tag color')->placeholder('Pick a color'));

    expect($node['type'])->toBe('field.color-picker')
        ->and($node['props']['palette'])->toBe(ColorPicker::DefaultPalette)
        ->and($node['props']['placeholder'])->toBe('Pick a color');
});

it('serializes a custom palette', function (): void {
    $node = wire(ColorPicker::make('color', 'Tag color')->palette(['#ff0000', '#00ff00']));

    expect($node['props']['palette'])->toBe(['#ff0000', '#00ff00']);
});

describe('docs fixtures', function (): void {
    it('matches the color picker example fixture', function (): void {
        assertFixtureMatches('color-picker.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            ColorPicker::make('color', 'Tag color')
                ->placeholder('Pick a color'),
        ]))));
    });
});
