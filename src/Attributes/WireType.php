<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use LogicException;
use Spatie\Attributes\Attributes;

/**
 * Base for every attribute that declares a wire type — the PHP↔JS discriminant.
 * Concrete roots (AsComponent, AsEffect, …) each key their own family; lookup
 * resolves against the calling attribute class, so a family never sees another
 * family's types.
 */
abstract readonly class WireType extends TypeScript
{
    public function __construct(public string $type) {}

    public function wireType(): string
    {
        return $this->type;
    }

    /**
     * The wire type declared by this attribute (or a subclass of it) on $class,
     * cached per attribute family and class.
     *
     * @param  class-string  $class
     */
    public static function wireTypeForClass(string $class): string
    {
        /** @var array<class-string, array<class-string, string>> $cache */
        static $cache = [];

        return $cache[static::class][$class] ??= self::resolveWireType(static::class, $class);
    }

    /**
     * @param  class-string<self>  $attribute
     * @param  class-string  $class
     */
    private static function resolveWireType(string $attribute, string $class): string
    {
        $instance = Attributes::get($class, $attribute);

        if ($instance === null) {
            throw new LogicException(sprintf(
                'Class [%s] is missing the #[%s] attribute that declares its wire type.',
                $class,
                class_basename($attribute),
            ));
        }

        return $instance->wireType();
    }
}
