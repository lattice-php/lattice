<?php
declare(strict_types=1);

use Lattice\Support\JsonSchema\JsonSchemaBuilder;

it('emits one document per wire package with cross-document refs', function (): void {
    $documents = app(JsonSchemaBuilder::class)->buildAll();

    expect($documents)->toHaveKeys(['lattice', 'core', 'ui', 'action', 'form', 'table'])
        ->and($documents['table']['$id'])->toBe('https://lattice-php.dev/schema/table/v1.json');

    $json = (string) json_encode($documents['table'], JSON_UNESCAPED_SLASHES);

    expect($json)->toContain('https://lattice-php.dev/schema/core/v1.json#/$defs/Color')
        ->and($documents['table']['$defs'])->not->toHaveKey('Color');
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

    expect($json)->toContain('https://lattice-php.dev/schema/lattice/v1.json#/$defs/CommonNodeProps');
});

it('cross-references a node def across documents through a nullable prop union', function (): void {
    $documents = app(JsonSchemaBuilder::class)->buildAll();

    $json = (string) json_encode($documents['action'], JSON_UNESCAPED_SLASHES);

    expect($documents['action']['$defs'])->not->toHaveKey('node:form')
        ->and($json)->toContain('https://lattice-php.dev/schema/form/v1.json#/$defs/node:form');
});
