<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Lattice\Support\TypeScript\OxfmtFormatter;

it('formats through the consumer oxfmt binary via stdin so ignore rules cannot exclude the target', function (): void {
    $nodeModules = base_path('node_modules');
    $binDirectory = $nodeModules.'/.bin';
    $binary = $binDirectory.'/oxfmt';
    $log = base_path('oxfmt-invocation.log');
    $target = base_path('generated-to-format.ts');
    $hadNodeModules = is_dir($nodeModules);

    try {
        File::ensureDirectoryExists($binDirectory);
        File::put($binary, "#!/bin/sh\nprintf '%s\\n' \"\$@\" > ".escapeshellarg($log)."\ntr -d ' '\n");
        chmod($binary, 0755);
        File::put($target, 'export type Example = {name: string};');

        (new OxfmtFormatter)->format([$target]);

        expect(File::get($log))->toBe("--stdin-filepath={$target}\n")
            ->and(File::get($target))->toBe('exporttypeExample={name:string};');
    } finally {
        File::delete([$binary, $log, $target]);

        if (! $hadNodeModules) {
            File::deleteDirectory($nodeModules);
        }
    }
});
