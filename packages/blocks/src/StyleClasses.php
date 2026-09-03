<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Core\Attributes\TypeScript;

/**
 * The CSS classes a {@see BlockStyle} value maps onto. One instance serves the
 * editor canvas, the in-app view and the HTML output, so the three agree on
 * what "wide" or "muted" looks like; the defaults are literals so the Tailwind
 * scanner sees every class.
 */
#[TypeScript]
final readonly class StyleClasses
{
    /**
     * @param  array<string, string>  $width
     * @param  array<string, string>  $paddingTop
     * @param  array<string, string>  $paddingBottom
     * @param  array<string, string>  $marginTop
     * @param  array<string, string>  $marginBottom
     * @param  array<string, string>  $background
     * @param  array<string, string>  $align
     */
    public function __construct(
        public array $width,
        public array $paddingTop,
        public array $paddingBottom,
        public array $marginTop,
        public array $marginBottom,
        public array $background,
        public string $backgroundPadding,
        public array $align,
        public string $hideOnMobile,
        public string $hideOnDesktop,
    ) {}

    public static function defaults(): self
    {
        return new self(
            width: [
                'content' => 'mx-auto w-full max-w-3xl',
                'wide' => 'mx-auto w-full max-w-6xl',
                'full' => 'w-full',
            ],
            paddingTop: ['none' => 'pt-0', 'xs' => 'pt-2', 'sm' => 'pt-4', 'md' => 'pt-8', 'lg' => 'pt-12', 'xl' => 'pt-20'],
            paddingBottom: ['none' => 'pb-0', 'xs' => 'pb-2', 'sm' => 'pb-4', 'md' => 'pb-8', 'lg' => 'pb-12', 'xl' => 'pb-20'],
            marginTop: ['none' => 'mt-0', 'xs' => 'mt-2', 'sm' => 'mt-4', 'md' => 'mt-8', 'lg' => 'mt-12', 'xl' => 'mt-20'],
            marginBottom: ['none' => 'mb-0', 'xs' => 'mb-2', 'sm' => 'mb-4', 'md' => 'mb-8', 'lg' => 'mb-12', 'xl' => 'mb-20'],
            background: [
                'none' => '',
                'muted' => 'bg-lt-muted text-lt-fg',
                'inverted' => 'bg-lt-fg text-lt-bg [&_h1,&_h2,&_h3,&_h4]:text-lt-bg',
                'primary' => 'bg-lt-primary text-lt-primary-fg [&_h1,&_h2,&_h3,&_h4]:text-lt-primary-fg',
            ],
            backgroundPadding: 'px-6',
            align: [
                'start' => 'text-start',
                'center' => 'text-center [&_.lt-blocks-prose]:mx-auto',
            ],
            hideOnMobile: 'max-md:hidden',
            hideOnDesktop: 'md:hidden',
        );
    }

    /**
     * The defaults with every entry of `$overrides` replaced, nested maps merged
     * per key so a theme swaps single values without restating the rest.
     *
     * @param  array<string, mixed>  $overrides
     */
    public static function withOverrides(array $overrides): self
    {
        $defaults = self::defaults();

        return new self(
            width: self::mergeMap($defaults->width, $overrides['width'] ?? null),
            paddingTop: self::mergeMap($defaults->paddingTop, $overrides['paddingTop'] ?? null),
            paddingBottom: self::mergeMap($defaults->paddingBottom, $overrides['paddingBottom'] ?? null),
            marginTop: self::mergeMap($defaults->marginTop, $overrides['marginTop'] ?? null),
            marginBottom: self::mergeMap($defaults->marginBottom, $overrides['marginBottom'] ?? null),
            background: self::mergeMap($defaults->background, $overrides['background'] ?? null),
            backgroundPadding: self::mergeString($defaults->backgroundPadding, $overrides['backgroundPadding'] ?? null),
            align: self::mergeMap($defaults->align, $overrides['align'] ?? null),
            hideOnMobile: self::mergeString($defaults->hideOnMobile, $overrides['hideOnMobile'] ?? null),
            hideOnDesktop: self::mergeString($defaults->hideOnDesktop, $overrides['hideOnDesktop'] ?? null),
        );
    }

    /**
     * @param  array<string, string>  $defaults
     * @return array<string, string>
     */
    private static function mergeMap(array $defaults, mixed $override): array
    {
        if (! is_array($override)) {
            return $defaults;
        }

        foreach ($override as $key => $value) {
            if (is_string($key) && is_string($value)) {
                $defaults[$key] = $value;
            }
        }

        return $defaults;
    }

    private static function mergeString(string $default, mixed $override): string
    {
        return is_string($override) ? $override : $default;
    }
}
