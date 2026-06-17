<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support;

use BackedEnum;
use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;

/**
 * A prefix or suffix attached to a field or menu item. Holds either an icon
 * (a sprite name) or literal text such as a unit, but never both.
 */
#[TypeScript]
final readonly class Affix implements JsonSerializable
{
    private function __construct(
        public ?string $icon = null,
        public ?string $text = null,
    ) {}

    public static function icon(BackedEnum|string $icon): self
    {
        return new self(icon: $icon instanceof BackedEnum ? (string) $icon->value : $icon);
    }

    public static function text(string $text): self
    {
        return new self(text: $text);
    }

    public static function from(self|BackedEnum|string $value): self
    {
        return match (true) {
            $value instanceof self => $value,
            $value instanceof BackedEnum => self::icon($value),
            default => self::text($value),
        };
    }

    /**
     * @return array{icon: string|null, text: string|null}
     */
    public function jsonSerialize(): array
    {
        return [
            'icon' => $this->icon,
            'text' => $this->text,
        ];
    }
}
