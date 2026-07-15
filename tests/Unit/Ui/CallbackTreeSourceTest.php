<?php
declare(strict_types=1);

use Lattice\Lattice\Ui\Sources\CallbackTreeSource;
use Lattice\Lattice\Ui\Values\TreeNode;

it('resolves roots and children from closures', function (): void {
    $source = new CallbackTreeSource(
        roots: fn (): array => [TreeNode::make('Root', '1')->hasChildren()],
        children: fn (string $parentId): array => [TreeNode::make("Child of {$parentId}", "{$parentId}.1")],
    );

    expect($source->roots()[0]->jsonSerialize())->toMatchArray(['id' => '1', 'hasChildren' => true])
        ->and($source->children('1')[0]->jsonSerialize())->toMatchArray(['id' => '1.1', 'label' => 'Child of 1']);
});

it('returns no children when no children closure is given', function (): void {
    $source = new CallbackTreeSource(roots: fn (): array => []);

    expect($source->children('1'))->toBe([]);
});
