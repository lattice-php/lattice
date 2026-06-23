<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Tooltip;

it('serializes content and an empty trigger by default', function (): void {
    $node = wire(Tooltip::make()->content('More about this metric.'));

    expect($node['type'])->toBe('tooltip')
        ->and($node['props']['content'])->toBe('More about this metric.')
        ->and($node['props']['trigger'])->toBe([]);
});

it('serializes a custom trigger slot', function (): void {
    $node = wire(
        Tooltip::make()->content('Still in beta.')->trigger([Badge::make('Beta')]),
    );

    expect($node['props']['trigger'])->toHaveCount(1)
        ->and($node['props']['trigger'][0]['type'])->toBe('badge');
});

it('omits trigger components hidden by a condition', function (): void {
    $node = wire(
        Tooltip::make()->content('x')->trigger([
            Badge::make('Visible'),
            Badge::make('Hidden')->when(false),
        ]),
    );

    expect($node['props']['trigger'])->toHaveCount(1);
});
