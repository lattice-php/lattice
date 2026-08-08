<?php
declare(strict_types=1);

use Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Tree\TreeRegistry;
use Workbench\App\Trees\CategoryTree;

it('resolves a discovered tree definition by its attribute key', function (): void {
    expect(app(TreeRegistry::class)->resolve('categories'))->toBeInstanceOf(CategoryTree::class);
});

it('throws UnknownComponent for an unknown key', function (): void {
    app(TreeRegistry::class)->resolve('nope');
})->throws(UnknownComponent::class);

it('builds the tree endpoint from the group convention', function (): void {
    expect(app(TreeRegistry::class)->endpointFor('categories'))
        ->toBe('/lattice/trees/categories');
});
