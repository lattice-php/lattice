<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Collapsible;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Support\Wire;

it('serializes its trigger, content, and default flags', function (): void {
    $node = wire(
        Collapsible::make('details')
            ->trigger([Text::make('Name')])
            ->content([Text::make('Hidden body')]),
    );

    expect($node['type'])->toBe('collapsible')
        ->and($node['props'])->toMatchArray([
            'collapsed' => true,
            'rememberState' => false,
        ])
        ->and($node['props']['trigger'])->toHaveCount(1)
        ->and($node['props']['trigger'][0]['type'])->toBe('text')
        ->and($node['schema'][0]['type'])->toBe('text');
});

it('serializes the open and remember-state flags', function (): void {
    $node = wire(Collapsible::make()->collapsed(false)->rememberState());

    expect($node['props'])->toMatchArray([
        'collapsed' => false,
        'rememberState' => true,
    ]);
});

it('serializes a collapsible tooltip', function (): void {
    $node = wire(Collapsible::make('details')->tooltip('Reveals the edit form.'));

    expect($node['props']['tooltip'])->toBe('Reveals the edit form.');
});

it('omits trigger components hidden by a condition', function (): void {
    $node = wire(
        Collapsible::make()->trigger([
            Text::make('Visible'),
            Text::make('Hidden')->hidden(),
        ]),
    );

    expect($node['props']['trigger'])->toHaveCount(1)
        ->and($node['props']['trigger'][0]['props']['text'])->toBe('Visible');
});

describe('docs fixtures', function (): void {
    it('matches the collapsible example fixture', function (): void {
        assertFixtureMatches('components.collapsible', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Collapsible::make('account-name')
                ->trigger([Text::make('Name')])
                ->tooltip('Shown on invoices and receipts.')
                ->content([Text::make('Update the name shown on your account.')]),
        ]))));
    });
});
