<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

it('keeps the committed generated.ts in sync with the transformer', function (): void {
    $committed = dirname(__DIR__, 3).'/resources/js/types/generated.ts';
    $output = sys_get_temp_dir().'/lattice-package-tests/generated-types-'.getmypid();

    config()->set('lattice.typescript.base_output', $output);

    try {
        artisan('lattice:typescript')->assertSuccessful();

        expect(file_get_contents($output.'/generated.ts'))->toBe(file_get_contents($committed));
    } finally {
        File::deleteDirectory($output);
    }
});
