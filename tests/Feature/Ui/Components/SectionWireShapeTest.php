<?php
declare(strict_types=1);

use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Section;

it('serializes an empty headerActions array by default', function (): void {
    expect(wire(Section::make('Team settings'))['props']['headerActions'])->toBe([]);
});

it('serializes header actions as button components on the section', function (): void {
    $section = Section::make('Team settings')->headerActions([
        Button::make('Edit'),
    ]);

    $payload = wire($section);

    expect($payload['props']['headerActions'])->toHaveCount(1);
    expect($payload['props']['headerActions'][0]['type'])->toBe('button');
    expect($payload['props']['headerActions'][0]['props']['label'])->toBe('Edit');
});

it('omits a header action hidden via visible(false) from the serialized headerActions', function (): void {
    $section = Section::make('Team settings')->headerActions([
        Button::make('Edit'),
        Button::make('Secret')->visible(false),
    ]);

    $labels = array_column(wire($section)['props']['headerActions'], 'props');

    expect(array_column($labels, 'label'))->toBe(['Edit']);
});
