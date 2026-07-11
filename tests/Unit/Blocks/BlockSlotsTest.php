<?php
declare(strict_types=1);

use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Ui\Components\Text;

test('returns rendered children for a named slot', function (): void {
    $text = Text::make('left content');
    $slots = new BlockSlots(['left' => [$text]]);

    expect($slots->get('left'))->toBe([$text]);
});

test('returns an empty array for an unknown slot', function (): void {
    $slots = new BlockSlots;

    expect($slots->get('missing'))->toBe([]);
});
