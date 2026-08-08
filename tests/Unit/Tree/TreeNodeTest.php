<?php
declare(strict_types=1);

use Lattice\Actions\Components\Action;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorKind;
use Lattice\Tree\TreeNode;
use Lattice\Ui\Components\Badge;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Stack;

it('produces a dense TreeNodeData with a default text schema', function (): void {
    $data = TreeNode::make('n1', 'Docs')->data([], false);

    expect($data->id)->toBe('n1')
        ->and($data->label)->toBe('Docs')
        ->and($data->schema)->toHaveCount(1)
        ->and($data->schema[0]->jsonSerialize()['type'])->toBe('text')
        ->and($data->schema[0]->jsonSerialize()['props']['text'])->toBe('Docs')
        ->and($data->href)->toBeNull()
        ->and($data->disabled)->toBeFalse()
        ->and($data->hasChildren)->toBeFalse()
        ->and($data->children)->toBe([]);
});

it('compiles icon and badge conveniences into the schema in order', function (): void {
    $schema = array_map(
        static fn (Component $component): array => $component->jsonSerialize(),
        TreeNode::make('n1', 'Docs')->icon('folder')->badge('12', 'blue')->data([], false)->schema,
    );

    expect(array_column($schema, 'type'))->toBe(['icon', 'text', 'badge'])
        ->and($schema[0]['props']['name'])->toBe('folder')
        ->and($schema[2]['props']['label'])->toBe('12')
        ->and($schema[2]['props']['color'])->toBeInstanceOf(Color::class)
        ->and($schema[2]['props']['color']->kind)->toBe(ColorKind::Named)
        ->and($schema[2]['props']['color']->value)->toBe('blue');
});

it('compiles the label as a link when href is set and not disabled', function (): void {
    $data = TreeNode::make('n1', 'Docs')->href('/docs')->data([], false);
    $link = $data->schema[0]->jsonSerialize();

    expect($data->href)->toBe('/docs')
        ->and($link['type'])->toBe('link')
        ->and($link['props']['label'])->toBe('Docs')
        ->and($link['props']['href'])->toBe('/docs');
});

it('compiles the label as plain text when disabled, even with href', function (): void {
    $schema = TreeNode::make('n1', 'Docs')->href('/docs')->disabled()->data([], false)->schema;

    expect($schema[0]->jsonSerialize()['type'])->toBe('text');
});

it('wraps actions in an end-floated row stack at the end of the schema', function (): void {
    $node = TreeNode::make('n1', 'Docs')->action(Action::make('delete')->label('Delete'));
    $schema = $node->data([], false)->schema;
    $stackComponent = end($schema);
    $stack = $stackComponent->jsonSerialize();

    expect($stackComponent)->toBeInstanceOf(Stack::class)
        ->and($stack['type'])->toBe('stack')
        ->and($stack['props']['float'])->toBe('end')
        ->and($stack['schema'][0])->toBeInstanceOf(Action::class)
        ->and($stack['schema'][0]->jsonSerialize()['type'])->toBe('action');
});

it('a custom schema replaces the composed default entirely', function (): void {
    $schema = TreeNode::make('n1', 'Docs')->icon('folder')
        ->schema([Badge::make('custom')])
        ->data([], false)->schema;

    expect($schema)->toHaveCount(1)
        ->and($schema[0]->jsonSerialize()['type'])->toBe('badge');
});

it('normalizes array-form children into TreeNode instances', function (): void {
    $node = TreeNode::make('p', 'Parent')->children([
        TreeNode::make('c', 'Child'),
        ['id' => 'c2', 'label' => 'From array', 'icon' => 'file'],
    ]);

    expect($node->children)->toHaveCount(2)
        ->and($node->children[1]->data([], false)->schema[0]->jsonSerialize()['type'])->toBe('icon');
});

it('marks a lazy boundary via the hasChildren flag without inline children', function (): void {
    $lazy = TreeNode::make('9', 'Suppliers')->hasChildren();

    expect($lazy->hasChildren)->toBeTrue()
        ->and($lazy->children)->toBe([]);
});

it('marks a disabled node', function (): void {
    expect(TreeNode::make('5', 'Plain')->disabled()->data([], false)->disabled)->toBeTrue();
});

it('normalizes an array of nodes and arrays via expand', function (): void {
    $nodes = TreeNode::expand([
        TreeNode::make('1', 'A'),
        ['id' => '2', 'label' => 'B'],
    ]);

    expect($nodes)->toHaveCount(2)
        ->and($nodes[1]->id)->toBe('2')
        ->and($nodes[1]->label)->toBe('B');
});
