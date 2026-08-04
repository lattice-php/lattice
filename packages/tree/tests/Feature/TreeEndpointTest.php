<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Tree\Tree;
use Workbench\App\Models\Category;
use Workbench\App\Trees\CategoryTree;
use Workbench\App\Trees\ScopedCategoryTree;

use function Pest\Laravel\getJson;

it('serves one level of children for a sealed tree', function (): void {
    $electronics = seedCategoryTree();
    $tree = $this->sealTree(Tree::use(CategoryTree::class)->lazy());

    $response = getJson(
        $tree['props']['endpoint'].'?parent='.$electronics->getKey(),
        ['X-Lattice-Ref' => $tree['props']['ref']],
    );

    $response->assertOk();

    $laptopsId = (string) Category::query()->where('name', 'Laptops')->value('id');

    $response->assertExactJson([
        'nodes' => [
            [
                'id' => $laptopsId,
                'label' => 'Laptops',
                'schema' => [
                    [
                        'type' => 'text',
                        'props' => [
                            'text' => 'Laptops',
                            'align' => null,
                            'color' => null,
                            'copyable' => false,
                            'size' => 'md',
                        ],
                    ],
                ],
                'hasChildren' => true,
            ],
        ],
    ]);
});

it('serves the roots when no parent is given', function (): void {
    seedCategoryTree();
    $tree = $this->sealTree(Tree::use(CategoryTree::class)->lazy());

    $response = getJson($tree['props']['endpoint'], ['X-Lattice-Ref' => $tree['props']['ref']]);

    $response->assertOk();
    expect(array_column($response->json('nodes'), 'label'))->toBe(['Books', 'Electronics']);
});

it('rejects a request without a ref', function (): void {
    seedCategoryTree();
    $tree = $this->sealTree(Tree::use(CategoryTree::class)->lazy());

    getJson($tree['props']['endpoint'])->assertForbidden();
});

it('rejects a forged ref', function (): void {
    seedCategoryTree();
    $tree = $this->sealTree(Tree::use(CategoryTree::class)->lazy());

    getJson($tree['props']['endpoint'], ['X-Lattice-Ref' => 'forged'])->assertForbidden();
});

it('rejects an expired ref', function (): void {
    seedCategoryTree();
    $tree = $this->sealTree(Tree::use(CategoryTree::class)->lazy());

    $this->travel(config('lattice.security.ref_lifetime', 30) + 1)->minutes();

    getJson($tree['props']['endpoint'], ['X-Lattice-Ref' => $tree['props']['ref']])->assertForbidden();
});

it('rejects a ref sealed for a different tree', function (): void {
    seedCategoryTree();
    $tree = $this->sealTree(Tree::use(CategoryTree::class)->lazy());

    $foreign = app(SignsComponentReferences::class)->seal('tree', 'denied', []);

    getJson($tree['props']['endpoint'], ['X-Lattice-Ref' => $foreign])->assertForbidden();
});

it('returns 404 for a sealed but unregistered tree key', function (): void {
    $ref = app(SignsComponentReferences::class)->seal('tree', 'ghost', []);

    getJson('/lattice/trees/ghost', ['X-Lattice-Ref' => $ref])->assertNotFound();
});

it('denies when the definition rejects authorization', function (): void {
    $ref = app(SignsComponentReferences::class)->seal('tree', 'denied', []);

    getJson('/lattice/trees/denied', ['X-Lattice-Ref' => $ref])->assertForbidden();
});

it('re-applies the sealed context on the endpoint', function (): void {
    Category::factory()->create(['name' => 'Electronics']);
    Category::factory()->create(['name' => 'Books']);

    $tree = $this->sealTree(
        Tree::use(ScopedCategoryTree::class, ['except' => 'Books'])->lazy(),
    );

    $response = getJson($tree['props']['endpoint'], ['X-Lattice-Ref' => $tree['props']['ref']]);

    expect(array_column($response->json('nodes'), 'label'))->toBe(['Electronics']);
});
