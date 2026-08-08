<?php
declare(strict_types=1);

use Lattice\Tree\CallbackTreeSource;
use Lattice\Tree\TreeNode;

it('resolves roots and children from closures', function (): void {
    $source = new CallbackTreeSource(
        roots: fn (): array => [TreeNode::make('1', 'Root')->hasChildren()],
        children: fn (string $parentId): array => [TreeNode::make("{$parentId}.1", "Child of {$parentId}")],
    );

    expect($source->roots()[0]->id)->toBe('1')
        ->and($source->roots()[0]->hasChildren)->toBeTrue()
        ->and($source->children('1')[0]->id)->toBe('1.1')
        ->and($source->children('1')[0]->label)->toBe('Child of 1');
});

it('returns no children when no children closure is given', function (): void {
    $source = new CallbackTreeSource(roots: fn (): array => []);

    expect($source->children('1'))->toBe([])
        ->and($source->path('1'))->toBeNull();
});

it('resolves an ancestor path when a path callback is given', function (): void {
    $source = new CallbackTreeSource(
        roots: fn (): array => [],
        path: fn (string $nodeId): ?array => $nodeId === 'target' ? ['root', 'parent'] : null,
    );

    expect($source->path('target'))->toBe(['root', 'parent'])
        ->and($source->path('missing'))->toBeNull();
});
