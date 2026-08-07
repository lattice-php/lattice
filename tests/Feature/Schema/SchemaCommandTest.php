<?php
declare(strict_types=1);

use Lattice\Support\JsonSchema\ExportSchemaProfile;
use Lattice\Support\JsonSchema\JsonSchemaProfile;

use function Pest\Laravel\artisan;

// Restore the default profile; the workbench binds BaseSchemaProfile.
beforeEach(function (): void {
    app()->bind(JsonSchemaProfile::class, ExportSchemaProfile::class);
});

it('assembles a bundle with the app\'s own document embedded under its own shortName', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);
        bindAppWireSource(dirname(__DIR__, 2).'/Fixtures/TypeScript');

        artisan('lattice:schema')->assertSuccessful();

        $document = json_decode((string) file_get_contents($output), true);

        expect($document['$id'])->toBe('https://lattice-php.dev/schema/lattice/v1.json')
            ->and($document['$defs']['app']['$defs'])->toHaveKey('SampleComponent')
            ->and($document['$defs']['app']['$defs'])->toHaveKey('node:sample.widget')
            ->and($document['$defs'])->not->toHaveKey('SampleComponent')
            ->and($document['$defs']['ui']['$defs'])->toHaveKey('Button');
    });
});

it('embeds every installed wire package without an app document when no root source is declared', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);

        artisan('lattice:schema')->assertSuccessful();

        $document = json_decode((string) file_get_contents($output), true);
        $embedded = array_filter($document['$defs'], static fn (mixed $value): bool => is_array($value) && isset($value['$id']));

        expect(array_keys($embedded))->toBe([
            'action', 'api-reference', 'core', 'form', 'media', 'signature-example', 'table', 'tree', 'ui',
        ])
            ->and($document['$defs']['signature-example']['$defs'])->toHaveKey('Signature');
    });
});
