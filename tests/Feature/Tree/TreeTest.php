<?php
declare(strict_types=1);

use Lattice\Tree\CallbackTreeSource;
use Lattice\Tree\Tree;
use Lattice\Tree\TreeNode;
use Lattice\Tree\TreeSource;
use Workbench\App\Actions\ShowTreeNodeInfoAction;

it('serializes an eager node tree with defaults', function (): void {
    $node = wire(
        Tree::make()->nodes([
            TreeNode::make('1', 'Electronics')->children([TreeNode::make('2', 'Laptops')]),
        ]),
    );

    expect($node['type'])->toBe('tree')
        ->and($node['props']['nodes'][0])->toHaveKeys(['id', 'label', 'schema', 'href', 'disabled', 'hasChildren', 'children'])
        ->and($node['props']['nodes'][0])->toMatchArray(['id' => '1', 'label' => 'Electronics'])
        ->and($node['props']['nodes'][0]['children'][0])->toMatchArray(['id' => '2', 'label' => 'Laptops'])
        ->and($node['props']['rememberState'])->toBeFalse()
        ->and($node['props']['defaultExpanded'])->toBe([]);
});

it('serializes activeId, defaultExpanded, and rememberState', function (): void {
    $node = wire(
        Tree::make()->nodes([TreeNode::make('1', 'A')])->activeId('1')->defaultExpanded(['1'])->rememberState(),
    );

    expect($node['props'])->toMatchArray([
        'activeId' => '1', 'defaultExpanded' => ['1'], 'rememberState' => true,
    ]);
});

it('serializes revision and registered interaction actions', function (): void {
    $node = $this->sealTree(fn (): Tree => Tree::make('categories')
        ->nodes([TreeNode::make('1', 'A')])
        ->revision('catalog-v2')
        ->selectAction(ShowTreeNodeInfoAction::class)
        ->moveAction(ShowTreeNodeInfoAction::class));

    expect($node['props']['revision'])->toBe('catalog-v2')
        ->and($node['props']['selectAction'])->toMatchArray(['type' => 'action'])
        ->and($node['props']['selectAction']['props']['ref'])->toBeString()
        ->and($node['props']['moveAction'])->toMatchArray(['type' => 'action'])
        ->and($node['props']['moveAction']['props']['ref'])->toBeString();
});

it('serializes maxDepth and defaults to unlimited', function (): void {
    $unlimited = wire(Tree::make()->nodes([TreeNode::make('1', 'A')]));
    $limited = wire(Tree::make()->nodes([TreeNode::make('1', 'A')])->maxDepth(2));
    $cleared = wire(Tree::make()->nodes([TreeNode::make('1', 'A')])->maxDepth(2)->maxDepth(null));

    expect($unlimited['props']['maxDepth'])->toBeNull()
        ->and($limited['props']['maxDepth'])->toBe(2)
        ->and($cleared['props']['maxDepth'])->toBeNull();
});

it('rejects a max depth below one', function (): void {
    Tree::make()->maxDepth(0);
})->throws(InvalidArgumentException::class, 'Tree max depth must be one or greater.');

it('derives the active node ancestor path from capable sources', function (): void {
    $source = new class implements TreeSource
    {
        public function roots(): array
        {
            return [TreeNode::make('root', 'Root')->hasChildren()];
        }

        public function children(string $parentId): array
        {
            return [];
        }

        public function path(string $nodeId): ?array
        {
            return $nodeId === 'target' ? ['root', 'parent'] : null;
        }
    };

    $node = wire(Tree::make()->source($source)->activeId('target'));

    expect($node['props']['activePath'])->toBe(['root', 'parent']);
});

it('serializes source children recursively for hasChildren nodes', function (): void {
    $childrenByParent = [
        'root' => [TreeNode::make('child', 'Child')->hasChildren()],
        'child' => [TreeNode::make('grandchild', 'Grandchild')],
    ];

    $node = wire(
        Tree::make()->source(new CallbackTreeSource(
            roots: fn (): array => [TreeNode::make('root', 'Root')->hasChildren()],
            children: fn (string $parentId): array => $childrenByParent[$parentId] ?? [],
        )),
    );

    $root = $node['props']['nodes'][0];
    expect($root)->toMatchArray(['id' => 'root', 'hasChildren' => true])
        ->and($root['children'][0])->toMatchArray(['id' => 'child'])
        ->and($root['children'][0]['children'][0])->toMatchArray(['id' => 'grandchild', 'label' => 'Grandchild']);
});

it('serializes source children beyond fifty levels', function (): void {
    $fetches = 0;

    $node = wire(
        Tree::make()->source(new CallbackTreeSource(
            roots: fn (): array => [TreeNode::make('n0', 'Root')->hasChildren()],
            children: function (string $parentId) use (&$fetches): array {
                $fetches++;
                $level = (int) substr($parentId, 1);

                return $level < 51
                    ? [TreeNode::make('n'.($level + 1), 'Child')->hasChildren($level < 50)]
                    : [];
            },
        )),
    );

    $boundary = $node['props']['nodes'][0];
    while ($boundary['children'] !== []) {
        $boundary = $boundary['children'][0];
    }

    expect($fetches)->toBe(51)
        ->and($boundary)->toMatchArray(['id' => 'n51']);
});

it('serializes inline children beyond fifty levels', function (): void {
    $subtree = TreeNode::make('leaf', 'Leaf');
    foreach (range(51, 0) as $level) {
        $subtree = TreeNode::make("n{$level}", "Level {$level}")->children([$subtree]);
    }

    $node = wire(Tree::make()->nodes([$subtree]));

    $boundary = $node['props']['nodes'][0];
    while ($boundary['children'] !== []) {
        $boundary = $boundary['children'][0];
    }

    expect($boundary)->toMatchArray(['id' => 'leaf', 'label' => 'Leaf']);
});

it('terminates a source cycle without serializing a duplicate node', function (): void {
    $node = wire(
        Tree::make()->source(new CallbackTreeSource(
            roots: fn (): array => [TreeNode::make('root', 'Root')->hasChildren()],
            children: fn (): array => [TreeNode::make('root', 'Root')->hasChildren()],
        )),
    );

    expect($node['props']['nodes'][0])->toMatchArray(['id' => 'root', 'hasChildren' => true])
        ->and($node['props']['nodes'][0]['children'])->toBe([]);
});

it('serves the package translations under the tree namespace', function (): void {
    expect(__('tree::tree.expand', ['label' => 'Electronics']))->toBe('Expand Electronics');
});
