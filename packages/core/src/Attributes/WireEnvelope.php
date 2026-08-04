<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use Spatie\Attributes\Attributes;

/**
 * Names the client-side envelope type (Node, ColumnNode, FilterNode) that
 * properties typed as this abstract marker class generate as — the mapping
 * lives on the class it describes, and the generation profiles iterate the
 * markers generically.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final readonly class WireEnvelope
{
    public function __construct(public string $envelope) {}

    /**
     * @param  class-string  $class
     */
    public static function forClass(string $class): string
    {
        $attribute = Attributes::get($class, self::class) ?? throw new \LogicException(sprintf(
            'Marker class [%s] carries no #[WireEnvelope] attribute.',
            $class,
        ));

        return $attribute->envelope;
    }
}
