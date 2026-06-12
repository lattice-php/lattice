<?php

declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\BadgeColumnProps;
use Lattice\Lattice\Tables\Columns\ColumnProps;
use Lattice\Lattice\Tables\Columns\TextColumnProps;

it('props VOs implement the ColumnProps contract and serialize full shape', function () {
    $badge = new BadgeColumnProps(colors: ['active' => 'green']);
    expect($badge)->toBeInstanceOf(ColumnProps::class)
        ->and(json_decode(json_encode($badge), true))->toBe(['colors' => ['active' => 'green']]);

    $text = new TextColumnProps;
    expect(json_decode(json_encode($text), true))->toBe([
        'date' => null,
        'copyable' => null,
        'link' => null,
    ]);
});
