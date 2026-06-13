<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\Component;

it('carries the type string', function () {
    $attribute = new Component('badge');

    expect($attribute->type)->toBe('badge');
});
