<?php
declare(strict_types=1);

use Lattice\Support\JsonSchema\FlatProjection;

it('inlines value objects and enums into component props', function (): void {
    $universe = [
        'Color' => ['type' => 'object', 'properties' => ['kind' => ['enum' => ['named', 'css']]]],
        'BadgeProps' => ['type' => 'object', 'properties' => ['color' => ['$ref' => '#/$defs/Color']]],
    ];
    $doc = ['$id' => 'x', '$defs' => ['BadgeProps' => $universe['BadgeProps']]];

    $projected = new FlatProjection()->project($doc, $universe);

    expect($projected['$defs']['BadgeProps']['properties']['color']['properties']['kind']['enum'])
        ->toBe(['named', 'css'])
        ->and(json_encode($projected))->not->toContain('Color');
});

it('keeps recursive envelope defs as intra-document refs', function (): void {
    $universe = ['Node' => ['type' => 'object', 'properties' => ['children' => ['items' => ['$ref' => '#/$defs/Node']]]]];
    $doc = ['$id' => 'x', '$defs' => ['CardProps' => ['properties' => ['body' => ['$ref' => '#/$defs/Node']]]]];

    $projected = new FlatProjection()->project($doc, $universe);

    expect($projected['$defs']['CardProps']['properties']['body'])->toBe(['$ref' => '#/$defs/Node'])
        ->and($projected['$defs'])->toHaveKey('Node');
});

it('resolves cross-document refs from the universe and inlines them', function (): void {
    $universe = [
        'Op' => ['type' => 'string', 'enum' => ['eq', 'neq']],
        'FilterProps' => ['type' => 'object', 'properties' => ['operator' => ['$ref' => 'https://lattice-php.dev/schema/core/v1.json#/$defs/Op']]],
    ];
    $doc = ['$id' => 'x', '$defs' => ['FilterProps' => $universe['FilterProps']]];

    $projected = new FlatProjection()->project($doc, $universe);

    expect($projected['$defs']['FilterProps']['properties']['operator'])->toBe(['type' => 'string', 'enum' => ['eq', 'neq']])
        ->and(json_encode($projected))->not->toContain('https://lattice-php.dev/schema/');
});

it('detects indirect cycles dynamically and falls back to an intra-document ref', function (): void {
    $universe = [
        'A' => ['type' => 'object', 'properties' => ['b' => ['$ref' => '#/$defs/B']]],
        'B' => ['type' => 'object', 'properties' => ['a' => ['$ref' => '#/$defs/A']]],
    ];
    $doc = ['$id' => 'x', '$defs' => ['RootProps' => ['properties' => ['start' => ['$ref' => '#/$defs/A']]]]];

    $projected = new FlatProjection()->project($doc, $universe);

    expect($projected['$defs']['RootProps']['properties']['start'])->toBe(['$ref' => '#/$defs/A'])
        ->and($projected['$defs']['A']['properties']['b']['properties']['a'])->toBe(['$ref' => '#/$defs/A'])
        ->and($projected['$defs'])->toHaveKey('A');
});

it('keeps $ref sibling keywords like readOnly when a ref is inlined', function (): void {
    $universe = ['SortDirection' => ['type' => 'string', 'enum' => ['asc', 'desc']]];
    $doc = ['$id' => 'x', '$defs' => ['SortProps' => ['properties' => ['direction' => ['$ref' => '#/$defs/SortDirection', 'readOnly' => true]]]]];

    $projected = new FlatProjection()->project($doc, $universe);

    expect($projected['$defs']['SortProps']['properties']['direction'])->toBe([
        'type' => 'string',
        'enum' => ['asc', 'desc'],
        'readOnly' => true,
    ]);
});

it('copies a foreign strict node envelope once instead of inlining it at every use site', function (): void {
    $universe = [
        'FormProps' => ['type' => 'object', 'properties' => ['label' => ['type' => 'string']]],
        'node:form' => ['type' => 'object', 'properties' => ['type' => ['const' => 'form'], 'props' => ['$ref' => '#/$defs/FormProps']], 'x-lattice' => ['kind' => 'strict']],
    ];
    $doc = ['$id' => 'x', '$defs' => ['ActionProps' => ['properties' => [
        'target' => ['anyOf' => [['$ref' => '#/$defs/node:form'], ['type' => 'null']]],
        'fallback' => ['$ref' => '#/$defs/node:form'],
    ]]]];

    $projected = new FlatProjection()->project($doc, $universe);

    expect($projected['$defs']['ActionProps']['properties']['target']['anyOf'][0])->toBe(['$ref' => '#/$defs/node:form'])
        ->and($projected['$defs']['ActionProps']['properties']['fallback'])->toBe(['$ref' => '#/$defs/node:form'])
        ->and($projected['$defs']['node:form']['properties']['props'])->toBe(['type' => 'object', 'properties' => ['label' => ['type' => 'string']]]);
});

it('copies a foreign props def once so two documents pulling it in agree on its shape', function (): void {
    $universe = [
        'HttpMethod' => ['type' => 'string', 'enum' => ['get', 'post'], 'x-lattice' => ['kind' => 'enum']],
        'Button' => ['type' => 'object', 'properties' => ['method' => ['$ref' => '#/$defs/HttpMethod']], 'x-lattice' => ['kind' => 'props']],
    ];
    $docA = ['$id' => 'a', '$defs' => ['ActionProps' => ['properties' => ['button' => ['$ref' => '#/$defs/Button']]]]];
    $docB = ['$id' => 'b', '$defs' => ['ModalProps' => ['properties' => ['button' => ['$ref' => '#/$defs/Button']]]]];

    $projectedA = new FlatProjection()->project($docA, $universe);
    $projectedB = new FlatProjection()->project($docB, $universe);

    expect($projectedA['$defs']['ActionProps']['properties']['button'])->toBe(['$ref' => '#/$defs/Button'])
        ->and($projectedA['$defs']['Button'])->toBe($projectedB['$defs']['Button']);
});

it('keeps a same-origin sibling of a foreign copy-once def local too, so every puller agrees on its shape', function (): void {
    $universe = [
        'Confirmation' => ['type' => 'object', 'properties' => ['label' => ['type' => 'string']]],
        'Action' => ['type' => 'object', 'properties' => ['confirmation' => ['$ref' => '#/$defs/Confirmation']], 'x-lattice' => ['kind' => 'props']],
    ];
    $defOrigins = ['Confirmation' => 'action', 'Action' => 'action'];

    $actionDoc = ['$id' => 'action', '$defs' => ['Action' => $universe['Action'], 'Confirmation' => $universe['Confirmation']]];
    $latticeDoc = ['$id' => 'lattice', '$defs' => ['ComponentNode' => ['oneOf' => [['$ref' => '#/$defs/Action']]]]];

    $projectedAction = new FlatProjection()->project($actionDoc, $universe, $defOrigins, 'action');
    $projectedLattice = new FlatProjection()->project($latticeDoc, $universe, $defOrigins, 'lattice');

    expect($projectedAction['$defs']['Action'])->toBe($projectedLattice['$defs']['Action'])
        ->and($projectedAction['$defs']['Confirmation'])->toBe($projectedLattice['$defs']['Confirmation'])
        ->and($projectedLattice['$defs']['Action']['properties']['confirmation'])->toBe(['$ref' => '#/$defs/Confirmation']);
});

it('does not let one same-origin promotion leak into an unrelated, differently-origined reference to the same def', function (): void {
    $universe = [
        'Orientation' => ['type' => 'string', 'enum' => ['horizontal', 'vertical'], 'x-lattice' => ['kind' => 'enum']],
        'Tabs' => ['type' => 'object', 'properties' => ['orientation' => ['$ref' => '#/$defs/Orientation']], 'x-lattice' => ['kind' => 'props']],
        'Wizard' => ['type' => 'object', 'properties' => ['orientation' => ['$ref' => '#/$defs/Orientation']], 'x-lattice' => ['kind' => 'props']],
    ];
    $defOrigins = ['Orientation' => 'ui', 'Tabs' => 'ui', 'Wizard' => 'form'];

    $doc = ['$id' => 'lattice', '$defs' => ['ComponentNode' => ['oneOf' => [
        ['$ref' => '#/$defs/Tabs'],
        ['$ref' => '#/$defs/Wizard'],
    ]]]];

    $projected = new FlatProjection()->project($doc, $universe, $defOrigins, 'lattice');

    expect($projected['$defs']['Tabs']['properties']['orientation'])->toBe(['$ref' => '#/$defs/Orientation'])
        ->and($projected['$defs']['Wizard']['properties']['orientation'])->toBe([
            'type' => 'string',
            'enum' => ['horizontal', 'vertical'],
            'x-lattice' => ['kind' => 'enum'],
        ]);
});

it('leaves same-document refs to sibling roots untouched', function (): void {
    $doc = [
        '$id' => 'x',
        '$defs' => [
            'Align' => ['type' => 'string', 'enum' => ['start', 'end']],
            'ColumnProps' => ['properties' => ['align' => ['$ref' => '#/$defs/Align']]],
        ],
    ];

    $projected = new FlatProjection()->project($doc, $doc['$defs']);

    expect($projected['$defs']['ColumnProps']['properties']['align'])->toBe(['$ref' => '#/$defs/Align'])
        ->and($projected['$defs']['Align'])->toBe(['type' => 'string', 'enum' => ['start', 'end']]);
});
