<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Illuminate\Contracts\Config\Repository;
use Lattice\Blocks\Enums\BlockBackground;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\TextAlign;

/**
 * Resolves the {@see StyleClasses} in force — the defaults with the theme's
 * `config('lattice.blocks.style_classes')` overrides — and maps a block's
 * style onto its frame classes. The editor receives the same map on the wire
 * so a style edit on the canvas needs no server round trip.
 */
final readonly class StyleClassMap
{
    public function __construct(private Repository $config) {}

    public function classes(): StyleClasses
    {
        $overrides = $this->config->get('lattice.blocks.style_classes', []);

        return StyleClasses::withOverrides(is_array($overrides) ? $overrides : []);
    }

    public function classesFor(BlockStyle $style): FrameClasses
    {
        $map = $this->classes();
        $background = $style->background instanceof BlockBackground && $style->background !== BlockBackground::None
            ? trim(($map->background[$style->background->value] ?? '').' '.$map->backgroundPadding)
            : null;
        $outer = [
            $style->marginTop instanceof Gap ? $map->marginTop[$style->marginTop->value] ?? null : null,
            $style->marginBottom instanceof Gap ? $map->marginBottom[$style->marginBottom->value] ?? null : null,
            $style->paddingTop instanceof Gap ? $map->paddingTop[$style->paddingTop->value] ?? null : null,
            $style->paddingBottom instanceof Gap ? $map->paddingBottom[$style->paddingBottom->value] ?? null : null,
            $background,
            $style->hideOnMobile ? $map->hideOnMobile : null,
            $style->hideOnDesktop ? $map->hideOnDesktop : null,
            $style->align instanceof TextAlign ? $map->align[$style->align->value] ?? null : null,
        ];

        return new FrameClasses(
            outer: implode(' ', array_filter($outer, static fn (?string $class): bool => $class !== null && $class !== '')),
            inner: $map->width[$style->width->value ?? 'full'] ?? '',
        );
    }
}
