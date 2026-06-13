<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\BadgeColumnProps;
use Lattice\Lattice\Tables\Columns\TextColumnProps;

it('props VOs implement the ColumnProps contract and serialize full shape', function () {
    $badge = new BadgeColumnProps(colors: ['active' => 'green']);
    expect(wire($badge))->toBe(['colors' => ['active' => 'green']]);

    $text = new TextColumnProps;
    expect(wire($text))->toBe([
        'date' => null,
        'copyable' => false,
        'link' => null,
    ]);
});
