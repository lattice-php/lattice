<?php
declare(strict_types=1);

use Lattice\Support\JsonSchema\JsonSchemaBuilder;

it('emits one document per wire package, restricted to that package\'s own classes', function (): void {
    $documents = app(JsonSchemaBuilder::class)->buildAll();

    expect($documents)->toHaveKeys(['lattice', 'core', 'ui', 'action', 'form', 'table'])
        ->and($documents['table']['$id'])->toBe('https://lattice-php.dev/schema/table/v1.json')
        ->and($documents['table']['$defs'])->not->toHaveKey('Color');
});

it('points a foreign class at a local pointer the internal document itself cannot resolve', function (): void {
    $documents = app(JsonSchemaBuilder::class)->buildAll();

    $json = (string) json_encode($documents['table']['$defs'], JSON_UNESCAPED_SLASHES);

    expect($json)->toContain('"$ref":"#/$defs/Color"')
        ->and($json)->not->toContain('https://lattice-php.dev/schema/');
});

it('keeps PagePayload, envelopes, and x-lattice catalogs in the lattice document', function (): void {
    $documents = app(JsonSchemaBuilder::class)->buildAll();
    $lattice = $documents['lattice'];

    expect($lattice['$defs'])->toHaveKeys(['PagePayload', 'Node', 'ColumnNode', 'FilterNode', 'Schema', 'CommonNodeProps', 'ComponentNode', 'RemoteManifest'])
        ->and($lattice)->toHaveKey('x-lattice')
        ->and($lattice['x-lattice']['families'])->toHaveKeys(['component', 'effect', 'editor-extension', 'column', 'filter']);

    foreach ($documents as $shortName => $document) {
        if ($shortName === 'lattice') {
            continue;
        }

        expect($document)->not->toHaveKey('x-lattice')
            ->and($document['$defs'])->not->toHaveKey('PagePayload')
            ->and($document['$defs'])->not->toHaveKey('Node');
    }
});

it('emits a schema document for tree from its own discover dirs', function (): void {
    $documents = app(JsonSchemaBuilder::class)->buildAll();

    expect($documents)->toHaveKey('tree')
        ->and($documents['tree']['$id'])->toBe('https://lattice-php.dev/schema/tree/v1.json')
        ->and($documents['tree']['$defs'])->toHaveKeys(['Tree', 'node:tree']);

    $json = (string) json_encode($documents['tree'], JSON_UNESCAPED_SLASHES);

    expect($json)->toContain('"$ref":"#/$defs/CommonNodeProps"');
});

it('points a node def in another package at the same local pointer form through a nullable prop union', function (): void {
    $documents = app(JsonSchemaBuilder::class)->buildAll();

    $json = (string) json_encode($documents['action'], JSON_UNESCAPED_SLASHES);

    expect($documents['action']['$defs'])->not->toHaveKey('node:form')
        ->and($json)->toContain('"$ref":"#/$defs/node:form"');
});
