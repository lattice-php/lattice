<?php
declare(strict_types=1);

use Lattice\Support\JsonSchema\ExportSchemaProfile;
use Lattice\Support\JsonSchema\JsonSchemaProfile;

use function Pest\Laravel\artisan;

// Restore the default profile; the workbench binds BaseSchemaProfile.
beforeEach(function (): void {
    app()->bind(JsonSchemaProfile::class, ExportSchemaProfile::class);
});

it('writes the merged document with app defs marked as app-origin', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);
        bindAppWireSource(dirname(__DIR__, 2).'/Fixtures/TypeScript');

        artisan('lattice:schema')->assertSuccessful();

        $document = json_decode((string) file_get_contents($output), true);

        expect($document['$id'])->toBe('https://lattice-php.dev/schema/v1.json')
            ->and($document['$defs']['SampleComponent']['x-lattice']['origin'])->toBe('app')
            ->and($document['$defs']['node:sample.widget']['x-lattice']['origin'])->toBe('app')
            ->and($document['$defs']['Button']['x-lattice'])->not->toHaveKey('origin')
            ->and($document['x-lattice']['families']['component']['types'])->toHaveKey('sample.widget');
    });
});

it('treats every installed wire package as a built-in with no origin marking, without a declared app root', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);

        artisan('lattice:schema')->assertSuccessful();

        $document = json_decode((string) file_get_contents($output), true);

        $appOriginDefs = array_filter(
            $document['$defs'],
            fn (array $def): bool => ($def['x-lattice']['origin'] ?? null) === 'app',
        );

        expect($document['$defs']['Signature']['x-lattice'])->not->toHaveKey('origin')
            ->and($appOriginDefs)->toBe([]);
    });
});
