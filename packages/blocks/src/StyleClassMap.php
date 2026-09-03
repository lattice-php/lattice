<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Illuminate\Contracts\Config\Repository;
use Lattice\Blocks\Enums\BlockBackground;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\TextAlign;

/**
 * Maps a {@see BlockStyle} onto CSS classes for plain HTML output. The
 * defaults mirror the editor's frame so a public page and the canvas agree;
 * `config('lattice.blocks.style_classes')` overrides any entry per theme.
 */
final readonly class StyleClassMap
{
    private const array SPACING = ['none' => '0', 'xs' => '2', 'sm' => '4', 'md' => '8', 'lg' => '12', 'xl' => '20'];

    public function __construct(private Repository $config) {}

    /**
     * @return array{outer: string, inner: string}
     */
    public function classesFor(BlockStyle $style): array
    {
        $map = $this->map();
        $outer = [
            $style->marginTop instanceof Gap ? $map['marginTop'][$style->marginTop->value] ?? null : null,
            $style->marginBottom instanceof Gap ? $map['marginBottom'][$style->marginBottom->value] ?? null : null,
            $style->paddingTop instanceof Gap ? $map['paddingTop'][$style->paddingTop->value] ?? null : null,
            $style->paddingBottom instanceof Gap ? $map['paddingBottom'][$style->paddingBottom->value] ?? null : null,
            ! $style->background instanceof BlockBackground || $style->background->value === 'none'
                ? null
                : trim(($map['background'][$style->background->value] ?? '').' '.$map['backgroundPadding']),
            $style->hideOnMobile ? $map['hideOnMobile'] : null,
            $style->hideOnDesktop ? $map['hideOnDesktop'] : null,
            $style->align instanceof TextAlign ? $map['align'][$style->align->value] ?? null : null,
        ];

        return [
            'outer' => implode(' ', array_filter($outer, static fn (?string $class): bool => $class !== null && $class !== '')),
            'inner' => $map['width'][$style->width->value ?? 'full'] ?? '',
        ];
    }

    /**
     * @return array{
     *     width: array<string, string>,
     *     paddingTop: array<string, string>,
     *     paddingBottom: array<string, string>,
     *     marginTop: array<string, string>,
     *     marginBottom: array<string, string>,
     *     background: array<string, string>,
     *     backgroundPadding: string,
     *     align: array<string, string>,
     *     hideOnMobile: string,
     *     hideOnDesktop: string,
     * }
     */
    public function map(): array
    {
        $overrides = $this->config->get('lattice.blocks.style_classes', []);

        /** @var array{width: array<string, string>, paddingTop: array<string, string>, paddingBottom: array<string, string>, marginTop: array<string, string>, marginBottom: array<string, string>, background: array<string, string>, backgroundPadding: string, align: array<string, string>, hideOnMobile: string, hideOnDesktop: string} */
        return array_replace_recursive(self::defaults(), is_array($overrides) ? $overrides : []);
    }

    /**
     * @return array{
     *     width: array<string, string>,
     *     paddingTop: array<string, string>,
     *     paddingBottom: array<string, string>,
     *     marginTop: array<string, string>,
     *     marginBottom: array<string, string>,
     *     background: array<string, string>,
     *     backgroundPadding: string,
     *     align: array<string, string>,
     *     hideOnMobile: string,
     *     hideOnDesktop: string,
     * }
     */
    public static function defaults(): array
    {
        return [
            'width' => [
                'content' => 'mx-auto w-full max-w-3xl',
                'wide' => 'mx-auto w-full max-w-6xl',
                'full' => 'w-full',
            ],
            'paddingTop' => self::spacing('pt'),
            'paddingBottom' => self::spacing('pb'),
            'marginTop' => self::spacing('mt'),
            'marginBottom' => self::spacing('mb'),
            'background' => [
                'none' => '',
                'muted' => 'bg-lt-muted text-lt-fg',
                'inverted' => 'bg-lt-fg text-lt-bg',
                'primary' => 'bg-lt-primary text-lt-primary-fg',
            ],
            'backgroundPadding' => 'px-6',
            'align' => [
                'start' => 'text-start',
                'center' => 'text-center',
            ],
            'hideOnMobile' => 'max-md:hidden',
            'hideOnDesktop' => 'md:hidden',
        ];
    }

    /**
     * @return array<string, string>
     */
    private static function spacing(string $prefix): array
    {
        return array_map(static fn (string $step): string => "{$prefix}-{$step}", self::SPACING);
    }
}
