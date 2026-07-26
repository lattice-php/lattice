<?php
declare(strict_types=1);

namespace Lattice\Lattice\Theme;

use InvalidArgumentException;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorKind;

/**
 * A brand colour and its companions — foreground, hover, active — as one
 * portable value. Slots are Colors, so each carries its own dark counterpart.
 * Swatch presets, user-defined presets, and stored per-tenant branding
 * (via toArray/fromArray) all normalize to this shape before the Theme
 * writes tokens.
 */
final readonly class ColorGroup
{
    private function __construct(
        public Color $color,
        public ?Color $foreground = null,
        public ?Color $hover = null,
        public ?Color $active = null,
    ) {}

    public static function make(Color|string $color): self
    {
        return new self(self::colorValue($color));
    }

    public function foreground(Color|string $value): self
    {
        return new self($this->color, self::colorValue($value), $this->hover, $this->active);
    }

    public function hover(Color|string $value): self
    {
        return new self($this->color, $this->foreground, self::colorValue($value), $this->active);
    }

    public function active(Color|string $value): self
    {
        return new self($this->color, $this->foreground, $this->hover, self::colorValue($value));
    }

    /**
     * @return array{color: array{value: string, dark: string|null}, foreground?: array{value: string, dark: string|null}, hover?: array{value: string, dark: string|null}, active?: array{value: string, dark: string|null}}
     */
    public function toArray(): array
    {
        $values = ['color' => $this->slotToArray($this->color)];

        foreach (['foreground', 'hover', 'active'] as $slot) {
            if ($this->{$slot} instanceof Color) {
                $values[$slot] = $this->slotToArray($this->{$slot});
            }
        }

        return $values;
    }

    /**
     * @param  array{color: array{value: string, dark?: string|null}|string, foreground?: array{value: string, dark?: string|null}|string, hover?: array{value: string, dark?: string|null}|string, active?: array{value: string, dark?: string|null}|string}  $values
     */
    public static function fromArray(array $values): self
    {
        $group = self::make(self::slotFromArray($values['color']));

        foreach (['foreground', 'hover', 'active'] as $slot) {
            if (isset($values[$slot])) {
                $group = $group->{$slot}(self::slotFromArray($values[$slot]));
            }
        }

        return $group;
    }

    /**
     * @return array{value: string, dark: string|null}
     */
    private function slotToArray(Color $color): array
    {
        return ['value' => $color->value, 'dark' => $color->dark];
    }

    /**
     * @param  array{value: string, dark?: string|null}|string  $value
     */
    private static function slotFromArray(array|string $value): Color
    {
        if (is_string($value)) {
            return Color::css($value);
        }

        $color = Color::css($value['value']);

        return isset($value['dark']) ? $color->dark($value['dark']) : $color;
    }

    private static function colorValue(Color|string $value): Color
    {
        if (is_string($value)) {
            return Color::css($value);
        }

        if ($value->kind === ColorKind::Named) {
            throw new InvalidArgumentException(
                'A named colour cannot define a theme; use Color::hex()/css() or a raw CSS string.',
            );
        }

        return $value;
    }
}
