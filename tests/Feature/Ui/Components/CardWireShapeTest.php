<?php
declare(strict_types=1);

use Lattice\Ui\Components\Button;
use Lattice\Ui\Components\Card;

it('serializes the card component wire shape', function (): void {
    $card = Card::make('Team settings', 'Manage how your team appears.');

    $payload = wire($card);

    expect($payload['type'])->toBe('card');
    expect($payload['props'])->toMatchArray([
        'title' => 'Team settings',
        'description' => 'Manage how your team appears.',
        'headerActions' => [],
    ]);
});

it('serializes header actions as button components on the card', function (): void {
    $card = Card::make('Team settings')->headerActions([
        Button::make('Edit'),
    ]);

    $payload = wire($card);

    expect($payload['props']['headerActions'])->toHaveCount(1);
    expect($payload['props']['headerActions'][0]['type'])->toBe('button');
    expect($payload['props']['headerActions'][0]['props']['label'])->toBe('Edit');
});

it('serializes an empty headerActions array by default', function (): void {
    expect(wire(Card::make('Team settings'))['props']['headerActions'])->toBe([]);
});

it('omits a header action hidden via visible(false) from the serialized headerActions', function (): void {
    $card = Card::make('Team settings')->headerActions([
        Button::make('Edit'),
        Button::make('Secret')->visible(false),
    ]);

    $labels = array_column(wire($card)['props']['headerActions'], 'props');

    expect(array_column($labels, 'label'))->toBe(['Edit']);
});
