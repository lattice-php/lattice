<?php
declare(strict_types=1);

use Lattice\Form\RichEditor\Extensions\Bold;
use Lattice\Support\Wire\WireModelBuilder;
use Lattice\Support\Wire\WireSourceCatalog;
use Lattice\Ui\Enums\ButtonType;

/**
 * @return array<string, mixed>
 */
function builtDocument(): array
{
    static $document = null;

    return $document ??= new WireModelBuilder()->build(app(WireSourceCatalog::class)->builtinDirs());
}

it('declares the 2020-12 dialect, the stable $id, and the protocol version', function (): void {
    $document = builtDocument();

    expect($document['$schema'])->toBe('https://json-schema.org/draft/2020-12/schema')
        ->and($document['$id'])->toBe('https://lattice-php.dev/schema/v1.json')
        ->and($document['x-lattice']['protocolVersion'])->toBe(1);
});

it('emits a props def per component with every wire prop required and sorted', function (): void {
    $button = builtDocument()['$defs']['Button'];

    expect($button['type'])->toBe('object')
        ->and(array_keys($button['properties']))->toBe($button['required'])
        ->and($button['required'])->toBe([
            'action', 'buttonType', 'effects', 'emphasis', 'href', 'icon', 'label', 'method', 'variant',
        ])
        ->and($button['properties']['buttonType'])->toBe(['$ref' => '#/$defs/ButtonType'])
        ->and($button['properties']['action'])->toBe([
            'anyOf' => [
                ['$ref' => '#/$defs/Node'],
                ['type' => 'null'],
            ],
        ]);
});

it('emits enum defs with values in case declaration order', function (): void {
    expect(builtDocument()['$defs']['ButtonType'])->toBe([
        'type' => 'string',
        'enum' => ['button', 'submit', 'reset'],
        'x-lattice' => ['kind' => 'enum', 'php' => ButtonType::class],
    ]);
});

it('emits a strict node def per component dispatching on a const type', function (): void {
    $node = builtDocument()['$defs']['node:button'];

    expect($node['properties']['type'])->toBe(['const' => 'button'])
        ->and($node['properties']['props']['allOf'])->toBe([
            ['$ref' => '#/$defs/Button'],
            ['$ref' => '#/$defs/CommonNodeProps'],
        ])
        ->and($node['properties']['schema'])->toBe(['$ref' => '#/$defs/Schema'])
        ->and($node['required'])->toBe(['type', 'props']);
});

it('authors the loose envelopes mirroring the client type calculus', function (): void {
    $defs = builtDocument()['$defs'];

    expect($defs['Node']['required'])->toBe(['type'])
        ->and($defs['Node']['properties']['schema'])->toBe(['$ref' => '#/$defs/Schema'])
        ->and($defs['Schema'])->toBe(['type' => 'array', 'items' => ['$ref' => '#/$defs/Node']])
        ->and($defs['ColumnNode']['required'])->toBe(['type', 'key', 'props'])
        ->and($defs['FilterNode']['required'])->toBe(['type', 'key', 'props'])
        ->and(array_keys($defs['CommonNodeProps']['properties']))->toBe(['dataBindings', 'hideWhenCollapsed']);
});

it('closes the strict component union over every discovered node def', function (): void {
    $union = builtDocument()['$defs']['ComponentNode']['oneOf'];

    expect($union)->toContain(['$ref' => '#/$defs/node:button'])
        ->toContain(['$ref' => '#/$defs/node:form'])
        ->toContain(['$ref' => '#/$defs/node:field.text-input']);
});

it('catalogs every family with resolvable node and props refs', function (): void {
    $document = builtDocument();
    $families = $document['x-lattice']['families'];

    expect(array_keys($families))->toBe(['component', 'effect', 'editor-extension', 'column', 'filter'])
        ->and($families['component']['types']['button'])->toBe([
            'node' => '#/$defs/node:button',
            'props' => '#/$defs/Button',
            'domain' => 'Ui',
        ]);

    foreach ($families as $family) {
        foreach ($family['types'] as $entry) {
            foreach (['node', 'props'] as $key) {
                $pointer = substr($entry[$key], strlen('#/$defs/'));
                expect($document['$defs'])->toHaveKey($pointer);
            }
        }
    }
});

it('emits registry families with prefixed def names and non-node envelopes', function (): void {
    $defs = builtDocument()['$defs'];

    expect($defs['EditorBold'])->toBe([
        'type' => 'object',
        'properties' => [],
        'additionalProperties' => false,
        'x-lattice' => ['kind' => 'props', 'family' => 'editor-extension', 'wireType' => 'bold', 'php' => Bold::class],
    ])
        ->and($defs['effect:toast']['properties']['type'])->toBe(['const' => 'toast'])
        ->and($defs['effect:toast']['required'])->toBe(['type', 'props'])
        ->and($defs['effect:toast'])->not->toHaveKey('schema');
});

it('catalogs the node type domains', function (): void {
    $domains = builtDocument()['x-lattice']['domains'];

    expect($domains['UiNodeType'])->toContain('button')
        ->and($domains['FormFieldNodeType'])->toContain('field.text-input')
        ->and($domains['FormNodeType'])->toContain('form')
        ->and($domains['NodeType'])->toContain('button')
        ->and($domains['ColumnNodeType'])->toContain('column.badge');
});

it('specifies the remote manifest contract', function (): void {
    $defs = builtDocument()['$defs'];

    expect($defs['RemoteManifest']['anyOf'][0]['items'])->toBe(['$ref' => '#/$defs/RemoteManifestNode'])
        ->and($defs['RemoteManifestNode']['properties']['props']['propertyNames'])->toBe([
            'not' => ['enum' => ['action', 'endpoint', 'ref', 'remote', 'tokenEndpoint']],
        ]);
});

it('exposes the page payload entry point', function (): void {
    $payload = builtDocument()['$defs']['PagePayload'];

    expect($payload['properties']['schema'])->toBe(['type' => 'array', 'items' => ['$ref' => '#/$defs/Node'], 'readOnly' => true])
        ->and($payload['required'])->toContain('title', 'layout', 'container', 'breadcrumbs', 'schema', 'listeners');
});
