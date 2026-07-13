<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\WireType;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;

/**
 * One wire-type family: where its classes come from and the type surface they
 * generate. The single table every generation stage shares — discovery buckets
 * attribute-sourced families by category, the base pass emits each `mapType`
 * (plus the loose alias), and the augment pass emits each `interface`. Adding
 * an augmentable family is one entry here plus its attribute.
 */
final readonly class WireFamily
{
    /**
     * @param  string  $category  the discovery bucket entries are keyed under
     * @param  string  $mapType  the generated `type => props` map alias
     * @param  string  $interface  the consumer-augmentable interface
     * @param  class-string<WireType>|null  $attribute  discovers the family's value objects; null for families sourced from discovered components
     * @param  string|null  $looseAlias  the loose union alias the base pass emits
     * @param  class-string|null  $reference  the PHP class whose references resolve to the loose alias
     * @param  string  $typeNamePrefix  prefixes the family's generated value-object type names, keeping them unique in the flat module
     */
    public function __construct(
        public string $category,
        public string $mapType,
        public string $interface,
        public ?string $attribute = null,
        public ?string $looseAlias = null,
        public ?string $reference = null,
        public string $typeNamePrefix = '',
    ) {}

    /**
     * @return list<self>
     */
    public static function all(): array
    {
        return [
            new self('component', 'ComponentPropsMap', 'ComponentProps'),
            new self('column', 'ColumnPropsMap', 'ColumnProps'),
            new self(
                'effect',
                'EffectPropsMap',
                'EffectProps',
                attribute: AsEffect::class,
                looseAlias: 'Effect',
                reference: EffectContract::class,
            ),
            new self('filter', 'FilterPropsMap', 'FilterProps'),
        ];
    }

    /**
     * The families whose value objects carry their own wire-type attribute.
     *
     * @return list<self>
     */
    public static function attributeFamilies(): array
    {
        return array_values(array_filter(
            self::all(),
            static fn (self $family): bool => $family->attribute !== null,
        ));
    }
}
