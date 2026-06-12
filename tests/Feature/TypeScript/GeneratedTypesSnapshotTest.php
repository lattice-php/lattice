<?php

declare(strict_types=1);

use function Pest\Laravel\artisan;

it('keeps the committed generated.ts in sync with the transformer', function () {
    $path = dirname(__DIR__, 3).'/resources/js/types/generated.ts';

    expect(file_exists($path))->toBeTrue();

    $before = file_get_contents($path);

    artisan('lattice:typescript')->assertSuccessful();

    $after = file_get_contents($path);

    file_put_contents($path, $before); // restore regardless of outcome

    expect($after)->toBe($before);
});
