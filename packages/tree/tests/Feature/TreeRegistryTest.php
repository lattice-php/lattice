<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Tree\AsTree;
use Lattice\Tree\EloquentTreeSource;
use Lattice\Tree\TreeRegistry;
use Workbench\App\Trees\CategoryTree;

it('registers the trees discovery kind', function (): void {
    expect(DiscoveryKinds::components())->toHaveKey('trees', AsTree::class);
});

it('resolves a discovered tree definition by its attribute key', function (): void {
    expect(app(TreeRegistry::class)->resolve('categories'))->toBeInstanceOf(CategoryTree::class);
});

it('resolves an explicitly registered definition', function (): void {
    $registry = app(TreeRegistry::class);
    $registry->register(CategoryTree::class);

    expect($registry->resolve('categories'))->toBeInstanceOf(CategoryTree::class);
});

it('throws UnknownComponent for an unknown key', function (): void {
    app(TreeRegistry::class)->resolve('nope');
})->throws(UnknownComponent::class);

it('builds the tree endpoint from the group convention', function (): void {
    expect(app(TreeRegistry::class)->endpointFor('categories'))
        ->toBe('/lattice/trees/categories');
});

it('exposes the definition source', function (): void {
    $definition = app(TreeRegistry::class)->resolve('categories');

    expect($definition->source())->toBeInstanceOf(EloquentTreeSource::class);
});
