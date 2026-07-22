<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Wizard;
use Lattice\Lattice\Forms\Components\WizardStep;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Text;

describe('docs fixtures', function (): void {
    it('matches the wizard example fixture', function (): void {
        assertFixtureMatches('wizard.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Wizard::make([
                WizardStep::make('customer')
                    ->description('Who is this order for?')
                    ->schema([
                        Text::make('Confirm the customer before moving on.'),
                    ]),
                WizardStep::make('shipping-address')
                    ->description('Where should we send it?')
                    ->schema([
                        Text::make('Add the shipping details.'),
                    ]),
                WizardStep::make('review')
                    ->description('Check everything before you finish.')
                    ->schema([
                        Text::make('Everything looks good — finish to place the order.'),
                    ]),
            ])->vertical(),
        ]))));
    });
});
