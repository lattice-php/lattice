<?php

declare(strict_types=1);

use Lattice\Lattice\Attributes\Column;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Tables\Columns\BadgeColumnProps;

it('is a Component attribute carrying type and props class', function () {
    $attribute = new Column(type: 'badge', props: BadgeColumnProps::class);

    expect($attribute)->toBeInstanceOf(Component::class)
        ->and($attribute->type)->toBe('badge')
        ->and($attribute->props)->toBe(BadgeColumnProps::class);
});
