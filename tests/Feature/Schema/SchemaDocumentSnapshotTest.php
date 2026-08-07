<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

it('keeps the committed lattice.schema.json in sync with the builder', function (): void {
    $committed = dirname(__DIR__, 3).'/packages/framework/resources/schema/lattice.schema.json';
    $output = sys_get_temp_dir().'/lattice-package-tests/wire-schema-'.getmypid();

    config()->set('lattice.schema.base_output', $output);

    try {
        artisan('lattice:schema')->assertSuccessful();

        expect(file_get_contents($output.'/lattice.schema.json'))->toBe(file_get_contents($committed));
    } finally {
        File::deleteDirectory($output);
    }
});
