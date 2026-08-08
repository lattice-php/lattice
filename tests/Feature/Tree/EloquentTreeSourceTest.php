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
        ->and($root['children'][0]['children'][0]['children'])->toBe([]);
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

it('orders eager roots and siblings by a custom column with deterministic tie breakers', function (): void {
    $secondAlpha = Category::factory()->create(['name' => 'Alpha', 'sort_order' => 2]);
    $first = Category::factory()->create(['name' => 'Zulu', 'sort_order' => 1]);
    $firstAlpha = Category::factory()->create(['name' => 'Alpha', 'sort_order' => 2]);
    $parent = Category::factory()->create(['name' => 'Parent', 'sort_order' => 3]);
    $childSecond = Category::factory()->childOf($parent)->create(['name' => 'Beta', 'sort_order' => 2]);
    $childFirst = Category::factory()->childOf($parent)->create(['name' => 'Zulu', 'sort_order' => 1]);

    $source = EloquentTreeSource::make(Category::class)->orderBy('sort_order');

    expect(array_map(fn (TreeNode $node): string => $node->id, $source->roots()))->toBe([
        (string) $first->getKey(),
        (string) $secondAlpha->getKey(),
        (string) $firstAlpha->getKey(),
        (string) $parent->getKey(),
    ])->and(array_map(fn (TreeNode $node): string => $node->id, $source->children((string) $parent->getKey())))->toBe([
        (string) $childFirst->getKey(),
        (string) $childSecond->getKey(),
    ]);
});

it('applies custom ordering to lazy roots and children', function (): void {
    $parent = Category::factory()->create(['name' => 'Parent', 'sort_order' => 2]);
    $firstRoot = Category::factory()->create(['name' => 'Later alphabetically', 'sort_order' => 1]);
    $secondChild = Category::factory()->childOf($parent)->create(['name' => 'Alpha', 'sort_order' => 2]);
    $firstChild = Category::factory()->childOf($parent)->create(['name' => 'Zulu', 'sort_order' => 1]);

    $source = EloquentTreeSource::make(Category::class)->orderBy('sort_order')->lazy();

    expect(array_map(fn (TreeNode $node): string => $node->id, iterator_to_array($source->roots())))->toBe([
        (string) $firstRoot->getKey(),
        (string) $parent->getKey(),
    ])->and(array_map(fn (TreeNode $node): string => $node->id, iterator_to_array($source->children((string) $parent->getKey()))))->toBe([
        (string) $firstChild->getKey(),
        (string) $secondChild->getKey(),
    ]);
});

it('maps eager and lazy models through the same node callback', function (): void {
    $parent = Category::factory()->create(['name' => 'Parent', 'is_active' => false]);
    $child = Category::factory()->childOf($parent)->create(['name' => 'Child']);
    $map = fn (Category $model, TreeNode $node): TreeNode => $node
        ->badge((string) $model->sort_order)
        ->disabled(! $model->is_active)
        ->href('/categories/'.$model->getKey());

    $eager = EloquentTreeSource::make(Category::class)->map($map);
    $lazy = EloquentTreeSource::make(Category::class)->map($map)->lazy();

    expect($eager->roots()[0])
        ->disabled->toBeTrue()
        ->badge->toBe('0')
        ->href->toBe('/categories/'.$parent->getKey())
        ->hasChildren->toBeTrue()
        ->and(iterator_to_array($lazy->children((string) $parent->getKey()))[0])
        ->href->toBe('/categories/'.$child->getKey());
});

it('resolves a scoped root-to-parent path for a node', function (): void {
    $root = Category::factory()->create(['name' => 'Root']);
    $parent = Category::factory()->childOf($root)->create(['name' => 'Parent']);
    $target = Category::factory()->childOf($parent)->create(['name' => 'Target']);
    $hidden = Category::factory()->childOf($root)->create(['name' => 'Hidden', 'is_active' => false]);

    $source = EloquentTreeSource::make(Category::class)
        ->scope(fn ($query) => $query->where('is_active', true));

    expect($source->path((string) $target->getKey()))->toBe([
        (string) $root->getKey(),
        (string) $parent->getKey(),
    ])
        ->and($source->path((string) $root->getKey()))->toBe([])
        ->and($source->path((string) $hidden->getKey()))->toBeNull();
});

it('resolves paths deeper than fifty ancestors', function (): void {
    $parent = Category::factory()->create(['name' => 'Level 0']);
    $ancestors = [$parent];

    foreach (range(1, 51) as $level) {
        $parent = Category::factory()->childOf($parent)->create(['name' => "Level {$level}"]);
        $ancestors[] = $parent;
    }

    expect(EloquentTreeSource::make(Category::class)->path((string) $parent->getKey()))->toBe(
        array_map(fn (Category $category): string => (string) $category->getKey(), array_slice($ancestors, 0, -1)),
    );
});

it('terminates path lookup when categories contain a cycle', function (): void {
    $first = Category::factory()->create(['name' => 'First']);
    $second = Category::factory()->childOf($first)->create(['name' => 'Second']);
    $first->update(['parent_id' => $second->getKey()]);

    DB::enableQueryLog();
    $path = EloquentTreeSource::make(Category::class)->path((string) $first->getKey());

    expect($path)->toBeNull()
        ->and(DB::getQueryLog())->toHaveCount(2);
});
