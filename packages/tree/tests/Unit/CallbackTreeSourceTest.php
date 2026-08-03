<?php
declare(strict_types=1);

use Lattice\Tree\CallbackTreeSource;
use Lattice\Tree\TreeNode;

it('resolves roots and children from closures', function (): void {
    $source = new CallbackTreeSource(
        roots: fn (): array => [TreeNode::make('1', 'Root')->hasChildren()],
        children: fn (string $parentId): array => [TreeNode::make("{$parentId}.1", "Child of {$parentId}")],
    );

    expect($source->roots()[0]->jsonSerialize())->toMatchArray(['id' => '1', 'hasChildren' => true])
        ->and($source->children('1')[0]->jsonSerialize())->toMatchArray(['id' => '1.1', 'label' => 'Child of 1']);
});

it('returns no children when no children closure is given', function (): void {
    $source = new CallbackTreeSource(roots: fn (): array => []);

    expect($source->children('1'))->toBe([]);
});
