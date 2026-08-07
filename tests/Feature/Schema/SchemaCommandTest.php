<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Lattice\Support\JsonSchema\ExportSchemaProfile;
use Lattice\Support\JsonSchema\JsonSchemaProfile;
use Lattice\Support\JsonSchema\WireSourceCatalog;

use function Pest\Laravel\artisan;

// Restore the default profile; the workbench binds BaseSchemaProfile.
beforeEach(function (): void {
    app()->bind(JsonSchemaProfile::class, ExportSchemaProfile::class);
});

it('merges the app\'s own document directly into the flat bundle, marked with x-lattice.origin app', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);
        bindAppWireSource(dirname(__DIR__, 2).'/Fixtures/TypeScript');

        artisan('lattice:schema')->assertSuccessful();

        $document = json_decode((string) file_get_contents($output), true);

        expect($document['$id'])->toBe('https://lattice-php.dev/schema/lattice/v1.json')
            ->and($document['$defs'])->toHaveKeys(['SampleComponent', 'node:sample.widget', 'Button'])
            ->and($document['$defs']['SampleComponent']['x-lattice']['origin'])->toBe('app')
            ->and($document['$defs']['Button'])->not->toHaveKey('origin');
    });
});

it('merges every installed wire package directly into the flat bundle when no root source is declared', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);

        artisan('lattice:schema')->assertSuccessful();

        $document = json_decode((string) file_get_contents($output), true);

        expect($document['$defs'])->toHaveKeys(['Signature', 'Button', 'Table'])
            ->and($document['$defs'])->not->toHaveKey('SampleComponent');
    });
});

it('merges an installed package\'s COMMITTED schema file, never reflecting its vendor PHP', function (): void {
    withScaffoldWorkspace(function (): void {
        $output = base_path('lattice.schema.json');

        config()->set('lattice.schema.output', $output);

        $catalog = WireSourceCatalog::fromApplication();
        $table = collect($catalog->discover())->firstWhere('shortName', 'table');
        $original = File::get($table->schemaPath());

        try {
            // Adds a def, doesn't touch or remove any existing one: framework's
            // own committed lattice.schema.json is itself already the full flat
            // merge (built once, at release time), so it independently carries
            // a copy of table's OTHER defs too — the merge is per-def, not
            // per-package, so it can't "erase" what framework's base already
            // has. Only an ADDITION unambiguously proves the read came from
            // table's fresh committed file (no PHP class named "Doctored"
            // could ever be reflected into existence).
            $doctored = json_decode($original, true);
            $doctored['$defs']['Doctored'] = ['type' => 'string'];
            File::put($table->schemaPath(), json_encode($doctored));

            artisan('lattice:schema')->assertSuccessful();

            $document = json_decode((string) file_get_contents($output), true);

            expect($document['$defs'])->toHaveKey('Doctored');
        } finally {
            File::put($table->schemaPath(), $original);
        }
    });
});
