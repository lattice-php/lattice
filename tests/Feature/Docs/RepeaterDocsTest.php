<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Repeater;
use Lattice\Form\Components\RowAction;
use Lattice\Form\Components\TextInput;

describe('docs fixtures', function (): void {
    it('matches the repeater example fixture', function (): void {
        assertFixtureMatches('repeater.basic', Wire::toWire([
            Repeater::make('items', 'Line items')
                ->schema([
                    TextInput::make('name', 'Name')->required(),
                    TextInput::make('qty', 'Qty')->rules(['numeric']),
                ])
                ->minItems(1)
                ->maxItems(5)
                ->reorderable()
                ->addLabel('Add line')
                ->defaultItems(1),
        ]));
    });

    it('matches the repeater row-actions example fixture', function (): void {
        assertFixtureMatches('repeater.row-actions', Wire::toWire([
            Repeater::make('items', 'Line items')
                ->schema([
                    TextInput::make('name', 'Name'),
                    TextInput::make('qty', 'Qty')->rules(['numeric']),
                ])
                ->rowActions([
                    RowAction::duplicate(),
                    RowAction::remove()->label('Delete'),
                ]),
        ]));
    });
});
