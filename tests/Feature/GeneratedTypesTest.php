<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Artisan;

it('keeps the generated TypeScript enums in sync with the PHP enums', function (): void {
    $path = dirname(__DIR__, 2).'/resources/js/generated/enums.ts';
    $committed = file_get_contents($path);

    Artisan::call('typescript:transform');
    $generated = file_get_contents($path);

    file_put_contents($path, $committed);

    expect($generated)->toBe($committed);
})->skip(
    fn (): bool => ! is_dir(dirname(__DIR__, 2).'/resources/js/generated'),
    'Generated TypeScript output directory is missing; run `composer types`.',
);
