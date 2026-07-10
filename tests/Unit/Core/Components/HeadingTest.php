<?php
declare(strict_types=1);

use Lattice\Lattice\Ui\Components\Heading;

it('serializes a heading tooltip', function (): void {
    $node = wire(Heading::make('Billing', 2)->tooltip('Invoices go out monthly.'));

    expect($node['props']['tooltip'])->toBe('Invoices go out monthly.');
});

it('serializes a null heading tooltip when unset', function (): void {
    $node = wire(Heading::make('Billing', 2));

    expect($node['props']['tooltip'])->toBeNull();
});
