<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;

describe('docs fixtures', function (): void {
    it('dumps the builder example', function (): void {
        dumpFixture('builder.basic', [
            Builder::make('items', 'Line items')
                ->blocks([
                    Block::make('text')->label('Text')->schema([
                        Textarea::make('content', 'Content')->required(),
                    ]),
                    Block::make('product')->label('Product line')->schema([
                        TextInput::make('product', 'Product')->required(),
                        TextInput::make('qty', 'Qty')->rules(['numeric']),
                        TextInput::make('price', 'Price')->rules(['numeric']),
                    ]),
                ])
                ->minItems(1)
                ->addLabel('Add block'),
        ]);

        expect('docs/fixtures/builder.basic.json')->toBeReadableFile();
    });
});
