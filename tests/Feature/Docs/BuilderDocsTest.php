<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Builder;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\Textarea;
use Lattice\Form\Components\TextInput;

describe('docs fixtures', function (): void {
    it('matches the builder example fixture', function (): void {
        assertFixtureMatches('builder.basic', Wire::toWire([
            Builder::make('items', 'Line items')
                ->templates([
                    RowTemplate::make('text')->label('Text')->schema([
                        Textarea::make('content', 'Content')->required(),
                    ]),
                    RowTemplate::make('product')->label('Product line')->schema([
                        TextInput::make('product', 'Product')->required(),
                        TextInput::make('qty', 'Qty')->rules(['numeric']),
                        TextInput::make('price', 'Price')->rules(['numeric']),
                    ]),
                ])
                ->minItems(1)
                ->addLabel('Add block'),
        ]));
    });
});
