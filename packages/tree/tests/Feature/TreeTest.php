<?php
declare(strict_types=1);

use Lattice\Tree\CallbackTreeSource;
use Lattice\Tree\Tree;
use Lattice\Tree\TreeNode;

it('serializes an eager node tree with defaults', function (): void {
    $node = wire(
        Tree::make()->nodes([
            TreeNode::make('1', 'Electronics')->children([TreeNode::make('2', 'Laptops')]),
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
        Tree::make()->nodes([TreeNode::make('1', 'A')])->activeId('1')->defaultExpanded(['1'])->rememberState(),
    );

    expect($node['props'])->toMatchArray([
        'activeId' => '1', 'defaultExpanded' => ['1'], 'rememberState' => true,
    ]);
});

it('serializes source children recursively for hasChildren nodes', function (): void {
    $childrenByParent = [
        'root' => [TreeNode::make('child', 'Child')->hasChildren()],
        'child' => [TreeNode::make('grandchild', 'Grandchild')],
    ];

    $node = wire(
        Tree::make()->source(new CallbackTreeSource(
            roots: fn (): array => [TreeNode::make('root', 'Root')->hasChildren()],
            children: fn (string $parentId): array => $childrenByParent[$parentId] ?? [],
        )),
    );

    $root = $node['props']['nodes'][0];
    expect($root)->toMatchArray(['id' => 'root', 'hasChildren' => true])
        ->and($root['children'][0])->toMatchArray(['id' => 'child'])
        ->and($root['children'][0]['children'][0])->toMatchArray(['id' => 'grandchild', 'label' => 'Grandchild']);
});

it('stops fetching source children at the depth cap so cyclic data terminates', function (): void {
    $fetches = 0;

    $node = wire(
        Tree::make()->source(new CallbackTreeSource(
            roots: fn (): array => [TreeNode::make('n0', 'Root')->hasChildren()],
            children: function (string $parentId) use (&$fetches): array {
                $fetches++;

                return [TreeNode::make("n{$fetches}", 'Child')->hasChildren()];
            },
        )),
    );

    $boundary = $node['props']['nodes'][0];
    while (isset($boundary['children'])) {
        $boundary = $boundary['children'][0];
    }

    expect($fetches)->toBe(50)
        ->and($boundary)->toMatchArray(['id' => 'n50', 'hasChildren' => true]);
});

it('truncates eager children at the depth cap with a hasChildren marker', function (): void {
    $subtree = TreeNode::make('leaf', 'Leaf');
    foreach (range(51, 0) as $level) {
        $subtree = TreeNode::make("n{$level}", "Level {$level}")->children([$subtree]);
    }

    $node = wire(Tree::make()->nodes([$subtree]));

    $boundary = $node['props']['nodes'][0];
    while (isset($boundary['children'])) {
        $boundary = $boundary['children'][0];
    }

    expect($boundary)->toMatchArray(['id' => 'n50', 'hasChildren' => true]);
});

it('serves the package translations under the tree namespace', function (): void {
    expect(__('tree::tree.expand', ['label' => 'Electronics']))->toBe('Expand Electronics');
});
