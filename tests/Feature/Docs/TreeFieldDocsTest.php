<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\RowTemplate;
use Lattice\Form\Components\Textarea;
use Lattice\Form\Components\TextInput;
use Lattice\Tree\Forms\Components\TreeField;

describe('docs fixtures', function (): void {
    it('matches the tree field example fixture', function (): void {
        assertFixtureMatches('tree-field.basic', Wire::toWire([
            TreeField::make('items', 'Line items')
                ->maxDepth(2)
                ->acceptsChildrenFor(['heading'])
                ->templates([
                    RowTemplate::make('heading')->label('Heading')->schema([
                        TextInput::make('title', 'Title')->required(),
                    ]),
                    RowTemplate::make('product')->label('Product line')->schema([
                        TextInput::make('product', 'Product')->required(),
                        TextInput::make('qty', 'Qty')->rules(['numeric']),
                    ]),
                    RowTemplate::make('text')->label('Text')->schema([
                        Textarea::make('content', 'Content')->required(),
                    ]),
                ])
                ->addLabel('Add block'),
        ]));
    });
});
