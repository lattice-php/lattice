<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\Component;

it('carries the type string and defaults flags to false', function () {
    $attribute = new Component('badge');

    expect($attribute->type)->toBe('badge')
        ->and($attribute->container)->toBeFalse()
        ->and($attribute->interactive)->toBeFalse();
});

it('accepts container and interactive flags', function () {
    $attribute = new Component('modal', container: true, interactive: true);

    expect($attribute->container)->toBeTrue()
        ->and($attribute->interactive)->toBeTrue();
});
