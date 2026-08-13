<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

it('keeps every committed .schema.json in sync with the builder', function (): void {
    $root = dirname(__DIR__, 3);
    $output = sys_get_temp_dir().'/lattice-package-tests/wire-schema-'.getmypid();

    config()->set('lattice.schema.base_output', $output);

    try {
        artisan('lattice:schema')->assertSuccessful();

        expect(file_get_contents($output.'/lattice.schema.json'))
            ->toBe(file_get_contents($root.'/packages/framework/resources/schema/lattice.schema.json'));
        expect(file_get_contents($output.'/core/core.schema.json'))
            ->toBe(file_get_contents($root.'/packages/core/resources/schema/core.schema.json'));
        expect(file_get_contents($output.'/ui/ui.schema.json'))
            ->toBe(file_get_contents($root.'/packages/ui/resources/schema/ui.schema.json'));
        expect(file_get_contents($output.'/form/form.schema.json'))
            ->toBe(file_get_contents($root.'/packages/form/resources/schema/form.schema.json'));
        expect(file_get_contents($output.'/table/table.schema.json'))
            ->toBe(file_get_contents($root.'/packages/table/resources/schema/table.schema.json'));
        expect(file_get_contents($output.'/action/action.schema.json'))
            ->toBe(file_get_contents($root.'/packages/action/resources/schema/action.schema.json'));
        expect(file_get_contents($output.'/media/media.schema.json'))
            ->toBe(file_get_contents($root.'/packages/media/resources/schema/media.schema.json'));
        expect(file_get_contents($output.'/tree/tree.schema.json'))
            ->toBe(file_get_contents($root.'/packages/tree/resources/schema/tree.schema.json'));
        expect(file_get_contents($output.'/calendar/calendar.schema.json'))
            ->toBe(file_get_contents($root.'/packages/calendar/resources/schema/calendar.schema.json'));
        expect(file_get_contents($output.'/search/search.schema.json'))
            ->toBe(file_get_contents($root.'/packages/search/resources/schema/search.schema.json'));
        expect(file_get_contents($output.'/api-reference/api-reference.schema.json'))
            ->toBe(file_get_contents($root.'/packages/api-reference/resources/schema/api-reference.schema.json'));
        expect(file_get_contents($output.'/signature-example/signature-example.schema.json'))
            ->toBe(file_get_contents($root.'/packages/signature-example/resources/schema/signature-example.schema.json'));
    } finally {
        File::deleteDirectory($output);
    }
});
