<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use InvalidArgumentException;
use Lattice\Lattice\Attributes\TypeScript;
use LogicException;

/**
 * A display colour carried on the wire as a tagged value: a theme-defined
 * named colour (semantic tokens and hue tones) or a raw CSS colour with an
 * optional dark-mode counterpart. `from()` provides the string sugar accepted
 * by public APIs — a known name becomes a named colour, anything else passes
 * through as CSS.
 */
#[TypeScript]
final readonly class Color
{
    private function __construct(
        public ColorKind $kind,
        public string $value,
        public ?string $dark = null,
    ) {}

    public static function named(ColorName $name): self
    {
        return new self(ColorKind::Named, $name->value);
    }

    public static function css(string $value): self
    {
        return new self(ColorKind::Css, $value);
    }

    public static function hex(string $value): self
    {
        if (preg_match('/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $value) !== 1) {
            throw new InvalidArgumentException(sprintf('[%s] is not a valid hex colour.', $value));
        }

        return new self(ColorKind::Css, $value);
    }

    public function dark(string $value): self
    {
        if ($this->kind !== ColorKind::Css) {
            throw new LogicException('Named colours take their dark value from the theme; dark() applies to css colours only.');
        }

        return new self($this->kind, $this->value, $value);
    }

    public static function from(self|ColorName|string $value): self
    {
        if ($value instanceof self) {
            return $value;
        }

        if ($value instanceof ColorName) {
            return self::named($value);
        }

        $name = ColorName::tryFrom($value);

        return $name === null ? self::css($value) : self::named($name);
    }

    public static function default(): self
    {
        return self::named(ColorName::Default);
    }

    public static function muted(): self
    {
        return self::named(ColorName::Muted);
    }

    public static function primary(): self
    {
        return self::named(ColorName::Primary);
    }

    public static function success(): self
    {
        return self::named(ColorName::Success);
    }

    public static function info(): self
    {
        return self::named(ColorName::Info);
    }

    public static function warning(): self
    {
        return self::named(ColorName::Warning);
    }

    public static function danger(): self
    {
        return self::named(ColorName::Danger);
    }

    public static function gray(): self
    {
        return self::named(ColorName::Gray);
    }

    public static function red(): self
    {
        return self::named(ColorName::Red);
    }

    public static function orange(): self
    {
        return self::named(ColorName::Orange);
    }

    public static function yellow(): self
    {
        return self::named(ColorName::Yellow);
    }

    public static function green(): self
    {
        return self::named(ColorName::Green);
    }

    public static function blue(): self
    {
        return self::named(ColorName::Blue);
    }

    public static function purple(): self
    {
        return self::named(ColorName::Purple);
    }
}
