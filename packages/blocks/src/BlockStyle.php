<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Blocks\Enums\BlockBackground;
use Lattice\Blocks\Enums\BlockWidth;
use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\TextAlign;

/**
 * The generic presentation of a block, kept apart from its data so the editor
 * can change it without a server round trip and a public renderer can map it
 * onto its own theme.
 */
#[TypeScript]
final readonly class BlockStyle
{
    public function __construct(
        public ?BlockWidth $width = null,
        public ?Gap $paddingTop = null,
        public ?Gap $paddingBottom = null,
        public ?Gap $marginTop = null,
        public ?Gap $marginBottom = null,
        public ?BlockBackground $background = null,
        public ?TextAlign $align = null,
        public bool $hideOnMobile = false,
        public bool $hideOnDesktop = false,
        public ?string $anchor = null,
    ) {}

    public static function empty(): self
    {
        return new self;
    }

    /**
     * @param  array<string, mixed>  $style
     */
    public static function fromArray(array $style): self
    {
        return new self(
            width: self::enum(BlockWidth::class, $style['width'] ?? null),
            paddingTop: self::enum(Gap::class, $style['paddingTop'] ?? null),
            paddingBottom: self::enum(Gap::class, $style['paddingBottom'] ?? null),
            marginTop: self::enum(Gap::class, $style['marginTop'] ?? null),
            marginBottom: self::enum(Gap::class, $style['marginBottom'] ?? null),
            background: self::enum(BlockBackground::class, $style['background'] ?? null),
            align: self::enum(TextAlign::class, $style['align'] ?? null),
            hideOnMobile: (bool) ($style['hideOnMobile'] ?? false),
            hideOnDesktop: (bool) ($style['hideOnDesktop'] ?? false),
            anchor: self::anchor($style['anchor'] ?? null),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'width' => $this->width?->value,
            'paddingTop' => $this->paddingTop?->value,
            'paddingBottom' => $this->paddingBottom?->value,
            'marginTop' => $this->marginTop?->value,
            'marginBottom' => $this->marginBottom?->value,
            'background' => $this->background?->value,
            'align' => $this->align?->value,
            'hideOnMobile' => $this->hideOnMobile,
            'hideOnDesktop' => $this->hideOnDesktop,
            'anchor' => $this->anchor,
        ];
    }

    /**
     * @template TEnum of \BackedEnum
     *
     * @param  class-string<TEnum>  $enum
     * @return TEnum|null
     */
    private static function enum(string $enum, mixed $value): ?\BackedEnum
    {
        return is_string($value) ? $enum::tryFrom($value) : null;
    }

    private static function anchor(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $anchor = trim((string) preg_replace('/[^A-Za-z0-9_-]+/', '-', $value), '-');

        return $anchor === '' ? null : $anchor;
    }
}
