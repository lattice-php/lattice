<?php
declare(strict_types=1);

use Opis\JsonSchema\Validator;

/**
 * @return list<string>
 */
function committedSchemaPaths(): array
{
    return glob(dirname(__DIR__, 3).'/packages/*/resources/schema/*.schema.json') ?: [];
}

it('commits every per-package schema file without a single cross-document $ref', function (): void {
    foreach (committedSchemaPaths() as $path) {
        $json = (string) file_get_contents($path);

        expect($json)->not->toContain('https://lattice-php.dev/schema/', basename($path).' contains a cross-document $ref');
    }
})->skip(fn (): bool => committedSchemaPaths() === [], 'no committed schema files found');

it('validates a real node payload against the committed table.schema.json standalone, with no other file registered', function (): void {
    $path = dirname(__DIR__, 3).'/packages/table/resources/schema/table.schema.json';
    $document = json_decode((string) file_get_contents($path), true);

    $validator = new Validator;
    $validator->resolver()?->registerRaw(json_decode((string) file_get_contents($path)), $document['$id']);

    $result = $validator->validate(
        json_decode((string) json_encode([
            'type' => 'column.boolean',
            'key' => 'active',
            'props' => [
                'align' => 'start', 'filter' => null, 'hiddenByDefault' => false,
                'label' => 'Active', 'options' => [], 'sortable' => true, 'toggleable' => true, 'width' => 'md',
            ],
        ])),
        $document['$id'].'#/$defs/column:column.boolean',
    );

    expect($result->isValid())->toBeTrue();
});

it('carries its own copy of the envelope core in every file that references node-shaped props', function (): void {
    foreach (committedSchemaPaths() as $path) {
        $json = (string) file_get_contents($path);
        $document = json_decode($json, true);

        if (! str_contains($json, '"$ref":"#/$defs/Node"') && ! str_contains($json, '"$ref": "#/$defs/Node"')) {
            continue;
        }

        expect($document['$defs'])->toHaveKeys(['Node', 'Schema'], basename($path).' references Node without carrying the envelope core');
    }
})->skip(fn (): bool => committedSchemaPaths() === [], 'no committed schema files found');

it('inlines a cross-package value object directly into a component/column/filter def instead of leaving a pointer', function (): void {
    $path = dirname(__DIR__, 3).'/packages/table/resources/schema/table.schema.json';
    $document = json_decode((string) file_get_contents($path), true);

    $colors = $document['$defs']['BadgeColumn']['properties']['colors'];

    expect(json_encode($colors))->toContain('Lattice\\\\Core\\\\Color')
        ->and($document['$defs'])->not->toHaveKey('Color');
});
