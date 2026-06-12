<?php

declare(strict_types=1);

use Lattice\Lattice\Layouts\Components\Breadcrumbs;

it('serializes as a breadcrumbs component carrying no server data', function () {
    expect(wire(Breadcrumbs::make())['type'])->toBe('breadcrumbs');
});
