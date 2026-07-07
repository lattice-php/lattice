<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

/**
 * One augmentable type-map: a wire `type` string → its props, contributed to by
 * both the package (the generated `mapType`, e.g. `ComponentPropsMap`) and consumer
 * apps (a `declare module` augmentation of `interface`, e.g. `ComponentProps`),
 * resolved uniformly on the client by `ResolveProps<interface, mapType, …>`.
 *
 * This is the single source of truth both generation passes share: the base pass
 * emits each `mapType`, the augment pass emits each `interface`. Adding a new
 * augmentable domain is one entry here.
 */
final readonly class AugmentableMap
{
    /**
     * @param  'component'|'column'|'effect'  $category  the discovery bucket entries are keyed under
     */
    public function __construct(
        public string $category,
        public string $mapType,
        public string $interface,
    ) {}

    /**
     * @return list<self>
     */
    public static function all(): array
    {
        return [
            new self('component', 'ComponentPropsMap', 'ComponentProps'),
            new self('column', 'ColumnPropsMap', 'ColumnProps'),
            new self('effect', 'EffectPropsMap', 'EffectProps'),
        ];
    }
}
