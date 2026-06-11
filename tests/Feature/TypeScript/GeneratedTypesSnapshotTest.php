<?php

declare(strict_types=1);

it('keeps the committed generated.ts in sync with the transformer', function () {
    $path = dirname(__DIR__, 3).'/resources/js/types/generated.ts';

    expect(file_exists($path))->toBeTrue();

    $before = file_get_contents($path);

    $this->artisan('typescript:transform')->assertSuccessful();

    $after = file_get_contents($path);

    file_put_contents($path, $before); // restore regardless of outcome

    expect($after)->toBe($before);
});
