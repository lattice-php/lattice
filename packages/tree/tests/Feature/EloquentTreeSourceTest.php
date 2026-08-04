<?php
declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Lattice\Tree\EloquentTreeSource;
use Lattice\Tree\Tree;
use Lattice\Tree\TreeNode;
use Workbench\App\Models\Category;

it('resolves root categories ordered by label, flagging hasChildren for parents only', function (): void {
    $electronics = Category::factory()->create(['name' => 'Electronics']);
    Category::factory()->childOf($electronics)->create(['name' => 'Laptops']);
    Category::factory()->create(['name' => 'Books']);

    $roots = EloquentTreeSource::make(Category::class)->roots();

    expect(array_map(fn (TreeNode $node): array => [$node->label, $node->id, $node->hasChildren], $roots))->toBe([
        ['Books', (string) Category::query()->where('name', 'Books')->value('id'), false],
        ['Electronics', (string) $electronics->getKey(), true],
    ]);
});

it('re-queries when the scope changes after a read', function (): void {
    Category::factory()->create(['name' => 'Books']);
    Category::factory()->create(['name' => 'Archive']);

    $source = EloquentTreeSource::make(Category::class);
    expect($source->roots())->toHaveCount(2);

    $source->scope(fn ($query) => $query->where('name', 'Books'));

    expect(array_map(fn (TreeNode $node): string => $node->label, $source->roots()))->toBe(['Books']);
});

it('resolves a category\'s immediate children ordered by label, flagging hasChildren for grandparents', function (): void {
    $electronics = Category::factory()->create(['name' => 'Electronics']);
    $laptops = Category::factory()->childOf($electronics)->create(['name' => 'Laptops']);
    Category::factory()->childOf($electronics)->create(['name' => 'Cameras']);
    Category::factory()->childOf($laptops)->create(['name' => 'Ultrabooks']);

    $children = EloquentTreeSource::make(Category::class)->children((string) $electronics->getKey());

    expect(array_map(fn (TreeNode $node): array => [$node->label, $node->id, $node->hasChildren], $children))->toBe([
        ['Cameras', (string) Category::query()->where('name', 'Cameras')->value('id'), false],
        ['Laptops', (string) $laptops->getKey(), true],
    ]);
});

it('serializes the whole hierarchy when wired through the Tree component', function (): void {
    $electronics = Category::factory()->create(['name' => 'Electronics']);
    $laptops = Category::factory()->childOf($electronics)->create(['name' => 'Laptops']);
    Category::factory()->childOf($laptops)->create(['name' => 'Ultrabooks']);

    $node = wire(Tree::make()->source(EloquentTreeSource::make(Category::class)));

    $root = $node['props']['nodes'][0];
    expect($root)->toMatchArray(['label' => 'Electronics', 'hasChildren' => true])
        ->and($root['children'][0])->toMatchArray(['label' => 'Laptops', 'hasChildren' => true])
        ->and($root['children'][0]['children'][0])->toMatchArray(['label' => 'Ultrabooks'])
        ->and($root['children'][0]['children'][0])->not->toHaveKey('children');
});

it('applies a query scope to both roots and children', function (): void {
    Category::factory()->create(['name' => 'Hidden Root']);
    $visible = Category::factory()->create(['name' => 'Visible Root']);
    Category::factory()->childOf($visible)->create(['name' => 'Hidden Child']);
    Category::factory()->childOf($visible)->create(['name' => 'Visible Child']);

    $source = EloquentTreeSource::make(Category::class)->scope(fn ($query) => $query->where('name', 'like', 'Visible%'));

    expect(array_map(fn (TreeNode $node): string => $node->label, $source->roots()))->toBe(['Visible Root'])
        ->and(array_map(fn (TreeNode $node): string => $node->label, $source->children((string) $visible->getKey())))->toBe(['Visible Child']);
});

it('queries one level per call in lazy mode instead of loading the table', function (): void {
    $electronics = Category::factory()->create(['name' => 'Electronics']);
    $laptops = Category::factory()->childOf($electronics)->create(['name' => 'Laptops']);
    Category::factory()->childOf($laptops)->create(['name' => 'Ultrabooks']);
    Category::factory()->create(['name' => 'Books']);

    $source = EloquentTreeSource::make(Category::class)->lazy();

    DB::enableQueryLog();
    $roots = iterator_to_array($source->roots());

    expect(DB::getQueryLog())->toHaveCount(1)
        ->and(array_map(fn (TreeNode $node): array => [$node->label, $node->hasChildren], $roots))
        ->toBe([['Books', false], ['Electronics', true]]);

    DB::flushQueryLog();
    $children = iterator_to_array($source->children((string) $electronics->getKey()));

    expect(DB::getQueryLog())->toHaveCount(1)
        ->and(array_map(fn (TreeNode $node): array => [$node->label, $node->hasChildren], $children))
        ->toBe([['Laptops', true]]);
});

it('applies the scope to lazy level queries and the has-children probe', function (): void {
    $electronics = Category::factory()->create(['name' => 'Electronics']);
    Category::factory()->childOf($electronics)->create(['name' => 'Hidden']);
    $clothing = Category::factory()->create(['name' => 'Clothing']);
    Category::factory()->childOf($clothing)->create(['name' => 'Men']);

    $source = EloquentTreeSource::make(Category::class)
        ->lazy()
        ->scope(fn ($query) => $query->where('name', '!=', 'Hidden'));

    $roots = iterator_to_array($source->roots());

    expect(array_map(fn (TreeNode $node): array => [$node->label, $node->hasChildren], $roots))
        ->toBe([['Clothing', true], ['Electronics', false]])
        ->and(iterator_to_array($source->children((string) $electronics->getKey())))->toBe([]);
});
