<?php
declare(strict_types=1);

use Lattice\Tree\Tree;
use Lattice\Tree\TreeNode;
use Workbench\App\Trees\CategoryTree;
use Workbench\App\Trees\DeniedTree;

it('builds an interactive tree from a definition', function (): void {
    seedCategoryTree();

    $node = wire(Tree::use(CategoryTree::class, ['tenant' => 7]));

    expect($node['type'])->toBe('tree')
        ->and($node['props']['endpoint'])->toBe('/lattice/trees/categories')
        ->and($node['props']['ref'])->toBeString()
        ->and(array_column($node['props']['nodes'], 'label'))->toBe(['Books', 'Electronics'])
        ->and($node['props']['nodes'][1]['children'][0]['children'][0]['label'])->toBe('Ultrabooks');
});

it('serializes only the roots for lazy eagerDepth 1', function (): void {
    seedCategoryTree();

    $node = wire(Tree::use(CategoryTree::class)->lazy());

    expect($node['props']['lazy'])->toBeTrue()
        ->and(array_column($node['props']['nodes'], 'label'))->toBe(['Books', 'Electronics'])
        ->and($node['props']['nodes'][1])->toMatchArray(['hasChildren' => true])
        ->and($node['props']['nodes'][1]['children'])->toBe([])
        ->and($node['props']['nodes'][0]['hasChildren'])->toBeFalse();
});

it('serializes two levels for lazy eagerDepth 2, marking the boundary', function (): void {
    seedCategoryTree();

    $node = wire(Tree::use(CategoryTree::class)->lazy(2));

    $laptops = $node['props']['nodes'][1]['children'][0];

    expect($laptops)->toMatchArray(['label' => 'Laptops', 'hasChildren' => true])
        ->and($laptops['children'])->toBe([]);
});

it('serializes a skeleton without nodes for lazy eagerDepth 0', function (): void {
    seedCategoryTree();

    $node = wire(Tree::use(CategoryTree::class)->lazy(0));

    expect($node['props']['nodes'])->toBe([])
        ->and($node['props']['lazy'])->toBeTrue()
        ->and($node['props']['ref'])->toBeString();
});

it('throws when lazy is called on a tree without a definition', function (): void {
    Tree::make('inline')->nodes([TreeNode::make('1', 'A')])->lazy();
})->throws(LogicException::class);

it('rejects a negative eager depth', function (): void {
    Tree::use(CategoryTree::class)->lazy(-1);
})->throws(InvalidArgumentException::class);

it('hides the tree when the definition denies authorization', function (): void {
    expect(Tree::use(DeniedTree::class)->shouldRender())->toBeFalse();
});

it('keeps interactive props inert on plain eager trees', function (): void {
    $node = wire(Tree::make()->nodes([TreeNode::make('1', 'A')]));

    expect($node['props']['ref'])->toBeNull()
        ->and($node['props']['endpoint'])->toBeNull()
        ->and($node['props']['lazy'])->toBeFalse();
});
