<?php
declare(strict_types=1);

use Lattice\Actions\Components\Action;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorKind;
use Lattice\Tree\TreeNode;
use Lattice\Ui\Components\Badge;

it('serializes id, label and a default text schema', function (): void {
    $data = TreeNode::make('n1', 'Docs')->serialiseShallow();

    expect($data['id'])->toBe('n1')
        ->and($data['label'])->toBe('Docs')
        ->and($data['schema'])->toHaveCount(1)
        ->and($data['schema'][0]['type'])->toBe('text')
        ->and($data['schema'][0]['props']['text'])->toBe('Docs')
        ->and($data)->not->toHaveKeys(['icon', 'badge', 'actions', 'href', 'disabled', 'hasChildren', 'children']);
});

it('compiles icon and badge conveniences into the schema in order', function (): void {
    $schema = TreeNode::make('n1', 'Docs')->icon('folder')->badge('12', 'blue')->serialiseShallow()['schema'];

    expect(array_column($schema, 'type'))->toBe(['icon', 'text', 'badge'])
        ->and($schema[0]['props']['name'])->toBe('folder')
        ->and($schema[2]['props']['label'])->toBe('12')
        ->and($schema[2]['props']['color'])->toBeInstanceOf(Color::class)
        ->and($schema[2]['props']['color']->kind)->toBe(ColorKind::Named)
        ->and($schema[2]['props']['color']->value)->toBe('blue');
});

it('compiles the label as a link when href is set and not disabled', function (): void {
    $schema = TreeNode::make('n1', 'Docs')->href('/docs')->serialiseShallow();

    expect($schema['href'])->toBe('/docs')
        ->and($schema['schema'][0]['type'])->toBe('link')
        ->and($schema['schema'][0]['props']['label'])->toBe('Docs')
        ->and($schema['schema'][0]['props']['href'])->toBe('/docs');
});

it('compiles the label as plain text when disabled, even with href', function (): void {
    $schema = TreeNode::make('n1', 'Docs')->href('/docs')->disabled()->serialiseShallow()['schema'];

    expect($schema[0]['type'])->toBe('text');
});

it('wraps actions in an end-floated row stack at the end of the schema', function (): void {
    $node = TreeNode::make('n1', 'Docs')->action(Action::make('delete')->label('Delete'));
    $schema = $node->serialiseShallow()['schema'];
    $stack = end($schema);

    expect($stack['type'])->toBe('stack')
        ->and($stack['props']['float'])->toBe('end')
        ->and($stack['schema'][0])->toBeInstanceOf(Action::class)
        ->and($stack['schema'][0]->jsonSerialize()['type'])->toBe('action');
});

it('a custom schema replaces the composed default entirely', function (): void {
    $data = TreeNode::make('n1', 'Docs')->icon('folder')
        ->schema([Badge::make('custom')])
        ->serialiseShallow();

    expect($data['schema'])->toHaveCount(1)
        ->and($data['schema'][0]['type'])->toBe('badge');
});

it('keeps children serialization recursive and sparse', function (): void {
    $data = TreeNode::make('p', 'Parent')->children([
        TreeNode::make('c', 'Child'),
        ['id' => 'c2', 'label' => 'From array', 'icon' => 'file'],
    ])->jsonSerialize();

    expect($data['children'])->toHaveCount(2)
        ->and($data['children'][1]['schema'][0]['type'])->toBe('icon');
});

it('marks a lazy boundary without emitting children', function (): void {
    $lazy = TreeNode::make('9', 'Suppliers')->hasChildren();

    expect($lazy->jsonSerialize())->toMatchArray(['hasChildren' => true])
        ->and($lazy->jsonSerialize())->not->toHaveKey('children');
});

it('marks a disabled node', function (): void {
    expect(TreeNode::make('5', 'Plain')->disabled()->serialiseShallow())
        ->toMatchArray(['disabled' => true]);
});

it('normalizes an array of nodes and arrays via expand', function (): void {
    $nodes = TreeNode::expand([
        TreeNode::make('1', 'A'),
        ['id' => '2', 'label' => 'B'],
    ]);

    expect($nodes)->toHaveCount(2)
        ->and($nodes[1]->jsonSerialize())->toMatchArray(['id' => '2', 'label' => 'B']);
});
