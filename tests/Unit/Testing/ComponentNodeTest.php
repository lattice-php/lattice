<?php

declare(strict_types=1);

use Lattice\Support\Testing\ComponentNode;

/**
 * @param  array<string, mixed>  $data
 */
function componentNode(array $data): ComponentNode
{
    return new ComponentNode($data);
}

it('reads type, id and props', function (): void {
    $n = componentNode(['type' => 'form', 'id' => 'create', 'props' => ['action' => '/p'], 'schema' => []]);

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
                ['type' => 'field.textarea', 'id' => null, 'props' => ['name' => 'reason'], 'schema' => []],
            ],
        ]], 'schema' => []],
    ]);

    expect($root->firstOfType('action', 'delete'))->not->toBeNull()
        ->and($root->field('reason'))->not->toBeNull();
});

it('finds a field by name and lists available field names', function (): void {
    $form = componentNode(['type' => 'form', 'id' => 'f', 'props' => [], 'schema' => [
        ['type' => 'field.text-input', 'id' => null, 'props' => ['name' => 'email'], 'schema' => []],
        ['type' => 'field.number-input', 'id' => null, 'props' => ['name' => 'price'], 'schema' => []],
    ]]);

    expect($form->field('email')?->prop('name'))->toBe('email')
        ->and($form->field('nope'))->toBeNull()
        ->and($form->availableFieldNames())->toBe(['email', 'price']);
});

it('matches itself when the root is the target type', function (): void {
    $form = componentNode(['type' => 'form', 'id' => 'create', 'props' => [], 'schema' => []]);

    expect($form->firstOfTypeIncludingSelf('form', 'create'))->toBe($form);
});

it('throws a clear error when findOrFail cannot find a match', function (): void {
    $root = ComponentNode::root([]);

    expect(fn () => $root->findOrFail(fn (ComponentNode $n): bool => $n->type() === 'missing', 'type "missing"'))
        ->toThrow(RuntimeException::class, 'No component node found matching type "missing". Available: ');
});

it('throws a clear error when firstOfTypeOrFail cannot find a match', function (): void {
    $root = ComponentNode::root([
        ['type' => 'action', 'id' => 'archive', 'props' => [], 'schema' => []],
    ]);

    expect(fn () => $root->firstOfTypeOrFail('action', 'missing'))
        ->toThrow(RuntimeException::class, 'No component of type [action] with id/key [missing] found. Available: action:archive');
});

it('throws a clear error when fieldOrFail cannot find a match', function (): void {
    $form = componentNode(['type' => 'form', 'id' => 'f', 'props' => [], 'schema' => [
        ['type' => 'field.text-input', 'id' => null, 'props' => ['name' => 'email'], 'schema' => []],
    ]]);

    expect(fn () => $form->fieldOrFail('missing'))
        ->toThrow(RuntimeException::class, 'No field named [missing] found. Available fields: email');
});

it('returns the matched node when the OrFail variants succeed', function (): void {
    $root = ComponentNode::root([
        ['type' => 'action', 'id' => 'archive', 'props' => ['label' => 'Archive'], 'schema' => [
            ['type' => 'field.text-input', 'id' => null, 'props' => ['name' => 'reason'], 'schema' => []],
        ]],
    ]);

    expect($root->firstOfTypeOrFail('action', 'archive')->prop('label'))->toBe('Archive')
        ->and($root->fieldOrFail('reason')->prop('name'))->toBe('reason')
        ->and($root->findOrFail(fn (ComponentNode $n): bool => $n->type() === 'action')->id())->toBe('archive');
});
