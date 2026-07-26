<?php
declare(strict_types=1);

use Lattice\Lattice\Support\JsonSchema\ExportSchemaProfile;
use Lattice\Lattice\Support\JsonSchema\JsonSchemaProfile;

use function Pest\Laravel\artisan;

// Restore the default profile; the workbench binds BaseSchemaProfile.
beforeEach(function (): void {
    app()->bind(JsonSchemaProfile::class, ExportSchemaProfile::class);
});

it('writes the merged document with app defs marked as app-origin', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);
        config()->set('lattice.discover', [dirname(__DIR__, 2).'/Fixtures/TypeScript']);

        artisan('lattice:schema')->assertSuccessful();

        $document = json_decode((string) file_get_contents($output), true);

        expect($document['$id'])->toBe('https://lattice-php.dev/schema/v1.json')
            ->and($document['$defs']['SampleComponent']['x-lattice']['origin'])->toBe('app')
            ->and($document['$defs']['node:sample.widget']['x-lattice']['origin'])->toBe('app')
            ->and($document['$defs']['Button']['x-lattice'])->not->toHaveKey('origin')
            ->and($document['x-lattice']['families']['component']['types'])->toHaveKey('sample.widget');
    });
});

it('marks composer component-package types as app-origin while built-ins stay unmarked', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);
        config()->set('lattice.discover', []);

        artisan('lattice:schema')->assertSuccessful();

        $document = json_decode((string) file_get_contents($output), true);

        $appOriginBuiltins = array_filter(
            $document['$defs'],
            fn (array $def): bool => ($def['x-lattice']['origin'] ?? null) === 'app'
                && str_starts_with($def['x-lattice']['php'] ?? '', 'Lattice\Lattice\\'),
        );

        expect($document['$defs']['Signature']['x-lattice']['origin'])->toBe('app')
            ->and($appOriginBuiltins)->toBe([]);
    });
});
