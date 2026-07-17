<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Ui\Values\TreeNode;

it('serializes a leaf node with its scalar props', function (): void {
    $node = TreeNode::make('Laptops', '2')->icon('cpu')->badge('42')->href('/c/2');

    expect($node->jsonSerialize())->toMatchArray([
        'id' => '2', 'label' => 'Laptops', 'icon' => 'cpu', 'badge' => '42', 'href' => '/c/2',
    ]);
});

it('serializes children recursively and marks a lazy boundary', function (): void {
    $node = TreeNode::make('Electronics', '1')->children([
        TreeNode::make('Laptops', '2'),
    ]);
    $lazy = TreeNode::make('Suppliers', '9')->hasChildren();

    expect($node->jsonSerialize()['children'][0])->toMatchArray(['id' => '2', 'label' => 'Laptops'])
        ->and($lazy->jsonSerialize())->toMatchArray(['hasChildren' => true])
        ->and($lazy->jsonSerialize())->not->toHaveKey('children');
});

it('omits absent optional keys', function (): void {
    expect(TreeNode::make('Plain', '5')->jsonSerialize())
        ->toBe(['id' => '5', 'label' => 'Plain']);
});

it('normalizes an array of nodes and arrays via expand', function (): void {
    $nodes = TreeNode::expand([
        TreeNode::make('A', '1'),
        ['id' => '2', 'label' => 'B'],
    ]);

    expect($nodes)->toHaveCount(2)
        ->and($nodes[1]->jsonSerialize())->toMatchArray(['id' => '2', 'label' => 'B']);
});

it('serializes an attached action under the actions key as a wire node', function (): void {
    $node = TreeNode::make('Laptops', '2')->action(Action::make('archive')->label('Archive'));

    expect($node->jsonSerialize()['actions'])->toHaveKey('type');
});
