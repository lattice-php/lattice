<?php
declare(strict_types=1);

use Lattice\Lattice\Layouts\Components\Callouts;

test('the callouts slot serializes to its wire type', function () {
    $wire = Callouts::make()->jsonSerialize();

    expect($wire['type'])->toBe('callouts')
        ->and($wire['props'])->toBe([]);
});
