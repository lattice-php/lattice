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
