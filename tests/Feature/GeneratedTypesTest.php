<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Artisan;

it('keeps the generated TypeScript types in sync with the PHP source', function (): void {
    $path = dirname(__DIR__, 2).'/resources/js/generated/types.ts';
    $committed = file_get_contents($path);

    Artisan::call('typescript:transform');
    $generated = file_get_contents($path);

    file_put_contents($path, $committed);

    expect($generated)->toBe($committed);
})->skip(
    fn (): bool => ! is_dir(dirname(__DIR__, 2).'/resources/js/generated'),
    'Generated TypeScript output directory is missing; run `composer types`.',
);
