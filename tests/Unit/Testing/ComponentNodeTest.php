<?php

declare(strict_types=1);

use Lattice\Lattice\Support\Testing\ComponentNode;

function node(array $data): ComponentNode
{
    return new ComponentNode($data);
}

it('reads type, id and props', function (): void {
    $n = node(['type' => 'form', 'id' => 'create', 'props' => ['action' => '/p'], 'schema' => []]);

    expect($n->type())->toBe('form')
        ->and($n->id())->toBe('create')
        ->and($n->prop('action'))->toBe('/p');
});

it('finds a descendant by type and id through schema', function (): void {
    $root = ComponentNode::root([
        ['type' => 'stack', 'id' => null, 'props' => [], 'schema' => [
            ['type' => 'action', 'id' => 'archive', 'props' => ['label' => 'Archive'], 'schema' => []],
        ]],
    ]);

    expect($root->firstOfType('action', 'archive')?->prop('label'))->toBe('Archive')
        ->and($root->firstOfType('action', 'missing'))->toBeNull();
});

it('descends into embedded form and bulkActions props', function (): void {
    $root = ComponentNode::root([
        ['type' => 'table', 'id' => 't', 'props' => ['bulkActions' => [
            ['type' => 'action', 'id' => 'delete', 'props' => [], 'schema' => []],
        ]], 'schema' => []],
        ['type' => 'action', 'id' => 'edit', 'props' => ['form' => [
            'type' => 'form', 'id' => 'edit-form', 'props' => [], 'schema' => [
                ['type' => 'form.textarea', 'id' => null, 'props' => ['name' => 'reason'], 'schema' => []],
            ],
        ]], 'schema' => []],
    ]);

    expect($root->firstOfType('action', 'delete'))->not->toBeNull()
        ->and($root->field('reason'))->not->toBeNull();
});

it('finds a field by name and lists available field names', function (): void {
    $form = node(['type' => 'form', 'id' => 'f', 'props' => [], 'schema' => [
        ['type' => 'form.text-input', 'id' => null, 'props' => ['name' => 'email'], 'schema' => []],
        ['type' => 'form.number-input', 'id' => null, 'props' => ['name' => 'price'], 'schema' => []],
    ]]);

    expect($form->field('email')?->prop('name'))->toBe('email')
        ->and($form->field('nope'))->toBeNull()
        ->and($form->availableFieldNames())->toBe(['email', 'price']);
});

it('matches itself when the root is the target type', function (): void {
    $form = node(['type' => 'form', 'id' => 'create', 'props' => [], 'schema' => []]);

    expect($form->firstOfTypeIncludingSelf('form', 'create'))->toBe($form);
});
