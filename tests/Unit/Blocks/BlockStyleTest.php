<?php
declare(strict_types=1);

use Lattice\Blocks\BlockStyle;
use Lattice\Blocks\Enums\BlockBackground;
use Lattice\Blocks\Enums\BlockWidth;
use Lattice\Ui\Enums\Gap;

it('drops unknown values and sanitizes the anchor when reading stored style', function (): void {
    $style = BlockStyle::fromArray([
        'width' => 'wide',
        'paddingTop' => 'lg',
        'background' => 'neon',
        'align' => 'left',
        'hideOnMobile' => 1,
        'anchor' => ' Hero Section! ',
    ]);

    expect($style->width)->toBe(BlockWidth::Wide)
        ->and($style->paddingTop)->toBe(Gap::Large)
        ->and($style->background)->toBeNull()
        ->and($style->align)->toBeNull()
        ->and($style->hideOnMobile)->toBeTrue()
        ->and($style->hideOnDesktop)->toBeFalse()
        ->and($style->anchor)->toBe('Hero-Section');
});

it('round-trips through toArray', function (): void {
    $style = new BlockStyle(width: BlockWidth::Content, background: BlockBackground::Muted, anchor: 'intro');

    expect(BlockStyle::fromArray($style->toArray()))->toEqual($style);
});
