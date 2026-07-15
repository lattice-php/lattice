<?php
declare(strict_types=1);

use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Tree;
use Lattice\Lattice\Ui\Values\TreeNode;

it('serializes an eager node tree with defaults', function (): void {
    $node = wire(
        Tree::make()->nodes([
            TreeNode::make('Electronics', '1')->children([TreeNode::make('Laptops', '2')]),
        ]),
    );

    expect($node['type'])->toBe('tree')
        ->and($node['props']['nodes'][0])->toMatchArray(['id' => '1', 'label' => 'Electronics'])
        ->and($node['props']['nodes'][0]['children'][0])->toMatchArray(['id' => '2', 'label' => 'Laptops'])
        ->and($node['props']['rememberState'])->toBeFalse()
        ->and($node['props']['defaultExpanded'])->toBe([]);
});

it('serializes activeId, defaultExpanded, and rememberState', function (): void {
    $node = wire(
        Tree::make()->nodes([TreeNode::make('A', '1')])->activeId('1')->defaultExpanded(['1'])->rememberState(),
    );

    expect($node['props'])->toMatchArray([
        'activeId' => '1', 'defaultExpanded' => ['1'], 'rememberState' => true,
    ]);
});

it('truncates children beyond eagerDepth to a lazy boundary', function (): void {
    $node = wire(
        Tree::make()->eagerDepth(1)->nodes([
            TreeNode::make('L0', 'a')->children([
                TreeNode::make('L1', 'b')->children([TreeNode::make('L2', 'c')]),
            ]),
        ]),
    );

    $l1 = $node['props']['nodes'][0]['children'][0];
    expect($l1)->toMatchArray(['id' => 'b', 'hasChildren' => true])
        ->and($l1)->not->toHaveKey('children');
});

describe('docs fixtures', function (): void {
    it('matches the tree example fixture', function (): void {
        assertFixtureMatches('components.tree', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Tree::make('category-tree')
                ->nodes([
                    TreeNode::make('Electronics', 'electronics')
                        ->icon('cpu')
                        ->children([
                            TreeNode::make('Laptops', 'electronics-laptops'),
                            TreeNode::make('Phones', 'electronics-phones')->href('/products/phones'),
                        ]),
                    TreeNode::make('Clothing', 'clothing')
                        ->badge('New')
                        ->children([
                            TreeNode::make('Men', 'clothing-men'),
                            TreeNode::make('Women', 'clothing-women'),
                        ]),
                ])
                ->activeId('electronics-phones')
                ->defaultExpanded(['electronics']),
        ]))));
    });
});
