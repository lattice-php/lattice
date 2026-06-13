<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\RowAction;
use Lattice\Lattice\Forms\Components\TextInput;

describe('docs fixtures', function (): void {
    it('dumps the repeater example', function (): void {
        dumpFixture('repeater.basic', [
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
        ]);

        expect('docs/fixtures/repeater.basic.json')->toBeReadableFile();
    });

    it('dumps the repeater row-actions example', function (): void {
        dumpFixture('repeater.row-actions', [
            Repeater::make('items', 'Line items')
                ->schema([
                    TextInput::make('name', 'Name'),
                    TextInput::make('qty', 'Qty')->rules(['numeric']),
                ])
                ->rowActions([
                    RowAction::duplicate(),
                    RowAction::remove()->label('Delete'),
                ]),
        ]);

        expect('docs/fixtures/repeater.row-actions.json')->toBeReadableFile();
    });
});
