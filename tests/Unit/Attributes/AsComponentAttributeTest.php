<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsComponent;

it('carries the type string', function (): void {
    $attribute = new AsComponent('badge');

    expect($attribute->type)->toBe('badge');
});
