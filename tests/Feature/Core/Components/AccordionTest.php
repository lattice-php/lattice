<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Ui\Components\Accordion;
use Lattice\Ui\Components\Collapsible;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;

it('serializes its children and default flags', function (): void {
    $node = wire(
        Accordion::make('criteria')->schema([
            Collapsible::make('first')->trigger([Text::make('First')]),
            Collapsible::make('second')->trigger([Text::make('Second')]),
        ]),
    );

    expect($node['type'])->toBe('accordion')
        ->and($node['props'])->toMatchArray([
            'defaultOpen' => null,
            'gap' => null,
        ])
        ->and($node['schema'])->toHaveCount(2)
        ->and($node['schema'][0]['key'])->toBe('first');
});

it('serializes the default-open item and gap', function (): void {
    $node = wire(Accordion::make('criteria')->defaultOpen('second')->gap(Gap::Medium));

    expect($node['props'])->toMatchArray([
        'defaultOpen' => 'second',
        'gap' => 'md',
    ]);
});

describe('docs fixtures', function (): void {
    it('matches the accordion example fixture', function (): void {
        assertFixtureMatches('components.accordion', Wire::toWire([
            Accordion::make('faq')->defaultOpen('shipping')->schema([
                Collapsible::make('shipping')
                    ->trigger([Text::make('When does my order ship?')])
                    ->content([Text::make('Orders placed before noon ship the same day.')]),
                Collapsible::make('returns')
                    ->trigger([Text::make('How do returns work?')])
                    ->content([Text::make('Print a label from your account within 30 days.')]),
            ]),
        ]));
    });
});
