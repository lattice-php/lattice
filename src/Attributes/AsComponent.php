<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use LogicException;
use ReflectionAttribute;
use ReflectionClass;

/**
 * Marks a renderable node for the generated node types and registry.
 */
#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsComponent extends TypeScript
{
    public function __construct(public string $type) {}

    /**
     * Resolve the wire type declared by an #[AsComponent] or subclass attribute
     * on $class, cached per class.
     *
     * @param  class-string  $class
     */
    public static function typeForClass(string $class): string
    {
        /** @var array<class-string, string> $cache */
        static $cache = [];

        return $cache[$class] ??= self::resolveType($class);
    }

    /**
     * @param  class-string  $class
     */
    private static function resolveType(string $class): string
    {
        $attributes = new ReflectionClass($class)->getAttributes(self::class, ReflectionAttribute::IS_INSTANCEOF);

        if ($attributes === []) {
            throw new LogicException(sprintf(
                'Class [%s] is missing the #[AsComponent] attribute that declares its wire type.',
                $class,
            ));
        }

        return $attributes[0]->newInstance()->type;
    }
}
