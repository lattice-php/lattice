<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use LogicException;
use ReflectionAttribute;
use ReflectionClass;

/**
 * Marks a renderable node for the generated node types and registry. The
 * `AsColumn` attribute extends this for table cells.
 */
#[Attribute(Attribute::TARGET_CLASS)]
class Component
{
    /**
     * @var array<class-string, string>
     */
    private static array $typeCache = [];

    public function __construct(public readonly string $type) {}

    /**
     * Resolve the wire type declared by a #[Component] (or subclass) attribute on
     * $class, cached per class.
     *
     * @param  class-string  $class
     */
    public static function typeForClass(string $class): string
    {
        return self::$typeCache[$class] ??= self::resolveType($class);
    }

    /**
     * @param  class-string  $class
     */
    private static function resolveType(string $class): string
    {
        $attributes = (new ReflectionClass($class))->getAttributes(self::class, ReflectionAttribute::IS_INSTANCEOF);

        if ($attributes === []) {
            throw new LogicException(sprintf(
                'Class [%s] is missing the #[Component] attribute that declares its wire type.',
                $class,
            ));
        }

        return $attributes[0]->newInstance()->type;
    }
}
