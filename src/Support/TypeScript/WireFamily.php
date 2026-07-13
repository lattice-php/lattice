<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Illuminate\Support\Str;
use Lattice\Lattice\Attributes\WireType;
use Lattice\Lattice\Effects\EffectRegistry;
use Lattice\Lattice\Support\WireTypeRegistry;
use LogicException;

/**
 * One wire-type family: a category, optionally backed by the registry that
 * declares its marking attribute and base class. Everything else derives from
 * the category — `{Stem}Props` (the augmentable interface), `{Stem}PropsMap`
 * (the generated map) and, for registry families, the loose `{Stem}` union
 * alias. The single table every generation stage shares; adding a family is
 * one entry here.
 */
final readonly class WireFamily
{
    /**
     * @param  class-string<WireTypeRegistry<covariant object>>|null  $registry
     */
    public function __construct(
        public string $category,
        public ?string $registry = null,
    ) {}

    /**
     * @return list<self>
     */
    public static function all(): array
    {
        return [
            new self('component'),
            new self('column'),
            new self('effect', EffectRegistry::class),
            new self('filter'),
        ];
    }

    /**
     * @return list<self>
     */
    public static function registryFamilies(): array
    {
        return array_values(array_filter(
            self::all(),
            static fn (self $family): bool => $family->registry !== null,
        ));
    }

    public function propsMap(): string
    {
        return $this->stem().'PropsMap';
    }

    public function propsInterface(): string
    {
        return $this->stem().'Props';
    }

    public function looseAlias(): string
    {
        return $this->stem();
    }

    /**
     * @return class-string<WireType>
     */
    public function attribute(): string
    {
        return $this->registry()::attribute();
    }

    /**
     * @return class-string
     */
    public function reference(): string
    {
        return $this->registry()::baseClass();
    }

    private function stem(): string
    {
        return Str::studly($this->category);
    }

    /**
     * @return class-string<WireTypeRegistry<covariant object>>
     */
    private function registry(): string
    {
        return $this->registry ?? throw new LogicException(sprintf(
            'The [%s] family is not backed by a registry.',
            $this->category,
        ));
    }
}
