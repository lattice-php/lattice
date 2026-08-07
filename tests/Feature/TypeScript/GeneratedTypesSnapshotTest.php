<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

it('keeps every committed generated.ts in sync with the schema-derived emitter', function (): void {
    $root = dirname(__DIR__, 3);
    $output = sys_get_temp_dir().'/lattice-package-tests/generated-types-'.getmypid();

    config()->set('lattice.typescript.base_output', $output);

    try {
        artisan('lattice:typescript')->assertSuccessful();

        expect(file_get_contents($output.'/generated.ts'))
            ->toBe(file_get_contents($root.'/packages/framework/resources/js/types/generated.ts'));
        expect(file_get_contents($output.'/form/generated.ts'))
            ->toBe(file_get_contents($root.'/packages/form/resources/js/generated.ts'));
        expect(file_get_contents($output.'/table/generated.ts'))
            ->toBe(file_get_contents($root.'/packages/table/resources/js/generated.ts'));
        expect(file_get_contents($output.'/action/generated.ts'))
            ->toBe(file_get_contents($root.'/packages/action/resources/js/generated.ts'));
        expect(file_get_contents($output.'/ui/generated.ts'))
            ->toBe(file_get_contents($root.'/packages/ui/resources/js/generated.ts'));
    } finally {
        File::deleteDirectory($output);
    }
});
