<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use InvalidArgumentException;
use Lattice\Core\Attributes\TypeScript;

/**
 * Which generic style controls the inspector offers for a block.
 */
#[TypeScript]
final readonly class BlockSupports
{
    public function __construct(
        public bool $width = true,
        public bool $spacing = true,
        public bool $background = true,
        public bool $align = true,
        public bool $visibility = true,
        public bool $anchor = true,
    ) {}

    public static function all(): self
    {
        return new self;
    }

    public static function none(): self
    {
        return new self(false, false, false, false, false, false);
    }

    public function without(string ...$features): self
    {
        $values = get_object_vars($this);

        foreach ($features as $feature) {
            if (! array_key_exists($feature, $values)) {
                throw new InvalidArgumentException("Unknown block style feature [{$feature}].");
            }

            $values[$feature] = false;
        }

        return new self(...$values);
    }

    public function only(string ...$features): self
    {
        return self::none()->with(...$features);
    }

    public function with(string ...$features): self
    {
        $values = get_object_vars($this);

        foreach ($features as $feature) {
            if (! array_key_exists($feature, $values)) {
                throw new InvalidArgumentException("Unknown block style feature [{$feature}].");
            }

            $values[$feature] = true;
        }

        return new self(...$values);
    }
}
