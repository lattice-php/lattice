<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Attributes;

use Attribute;
use InvalidArgumentException;
use Lattice\Lattice\Attributes\TypeScript;
use Spatie\Attributes\Attributes;

/**
 * Marks an effect value object and declares its wire type — the PHP↔JS
 * discriminant that keys the `Effect` union. Discovery shares ClassWalker, but
 * the attribute stays distinct by design (effects form the discriminated
 * `Effect` union, not the node hierarchy).
 */
#[Attribute(Attribute::TARGET_CLASS)]
final readonly class AsEffect extends TypeScript
{
    public function __construct(public string $type) {}

    public function wireType(): string
    {
        return $this->type;
    }

    /**
     * @param  class-string  $class
     */
    public static function wireTypeForClass(string $class): string
    {
        $attribute = Attributes::get($class, self::class);

        if ($attribute === null) {
            throw new InvalidArgumentException(sprintf(
                'Effect [%s] is missing the #[AsEffect] attribute that declares its wire type.',
                $class,
            ));
        }

        return $attribute->wireType();
    }
}
