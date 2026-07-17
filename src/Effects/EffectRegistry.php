<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Support\WireTypeRegistry;

/**
 * The single source of truth for effect value objects: wire type → class-string.
 * Drives TypeScript generation and guards wire-type uniqueness. It is NOT a
 * gate for emitting — ActionResult::effect() and Effects::flash() accept any
 * Effect regardless of registration.
 *
 * @extends WireTypeRegistry<Effect>
 */
final class EffectRegistry extends WireTypeRegistry
{
    /**
     * A fresh registry holding only the package's built-in effects. Used by the
     * container binding and by TypeScript generation, both of which need the
     * built-in set independent of an application's runtime registrations.
     */
    public static function withBuiltins(): self
    {
        $registry = new self;
        $registry->registerAllIn(__DIR__.'/Builtin');

        return $registry;
    }

    #[\Override]
    public static function attribute(): string
    {
        return AsEffect::class;
    }

    #[\Override]
    public static function baseClass(): string
    {
        return Effect::class;
    }
}
