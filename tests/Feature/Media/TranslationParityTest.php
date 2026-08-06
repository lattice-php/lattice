<?php
declare(strict_types=1);

use Illuminate\Support\Arr;

use function Orchestra\Testbench\package_path;

test('every translation key in the english file has a german counterpart and vice versa', function (): void {
    $english = array_keys(Arr::dot(require package_path('packages/media/lang/en/media.php')));
    $german = array_keys(Arr::dot(require package_path('packages/media/lang/de/media.php')));

    sort($english);
    sort($german);

    expect(array_diff($english, $german))->toBe([])
        ->and(array_diff($german, $english))->toBe([]);
});
