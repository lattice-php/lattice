<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;

it('uses the consumer oxfmt binary before the package fallback', function (): void {
    $nodeModules = base_path('node_modules');
    $binDirectory = $nodeModules.'/.bin';
    $binary = $binDirectory.'/oxfmt';
    $log = base_path('oxfmt-invocation.log');
    $target = base_path('generated-to-format.ts');
    $hadNodeModules = is_dir($nodeModules);

    try {
        File::ensureDirectoryExists($binDirectory);
        File::put($binary, "#!/bin/sh\nprintf '%s\\n' \"\$@\" > ".escapeshellarg($log)."\n");
        chmod($binary, 0755);
        File::put($target, 'export type Example={name:string};');

        (new OxfmtFormatter)->format([$target]);

        expect(File::get($log))->toBe("--write\n{$target}\n");
    } finally {
        File::delete([$binary, $log, $target]);

        if (! $hadNodeModules) {
            File::deleteDirectory($nodeModules);
        }
    }
});
