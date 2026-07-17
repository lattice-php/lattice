<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support;

use InvalidArgumentException;
use Lattice\Lattice\Attributes\WireType;

/**
 * A wire type → class-string registry for one value-object family (effects,
 * editor extensions, …): built-ins auto-register at boot, consumers register
 * their own classes in a service provider. Guards the family's base class and
 * wire-type uniqueness, and resolves type strings back to their classes.
 *
 * @template T of object
 */
abstract class WireTypeRegistry
{
    /**
     * @var array<string, class-string<T>>
     */
    private array $entries = [];

    /**
     * @return class-string<WireType> the attribute declaring the family's wire types
     */
    abstract public static function attribute(): string;

    /**
     * @return class-string the base every registered class must extend or implement
     */
    abstract public static function baseClass(): string;

    /**
     * @param  class-string  $class
     */
    public function register(string $class): void
    {
        if (! is_a($class, static::baseClass(), true)) {
            throw new InvalidArgumentException(sprintf(
                '[%s] must extend or implement [%s].',
                $class,
                static::baseClass(),
            ));
        }

        $attribute = static::attribute();
        $type = $attribute::wireTypeForClass($class);

        if (isset($this->entries[$type]) && $this->entries[$type] !== $class) {
            throw new InvalidArgumentException(sprintf(
                'Wire type [%s] is already registered to [%s].',
                $type,
                $this->entries[$type],
            ));
        }

        /** @var class-string<T> $class */
        $this->entries[$type] = $class;
    }

    /**
     * @return array<string, class-string<T>>
     */
    public function all(): array
    {
        return $this->entries;
    }

    /**
     * @return class-string<T>|null
     */
    public function classFor(string $type): ?string
    {
        return $this->entries[$type] ?? null;
    }
}
