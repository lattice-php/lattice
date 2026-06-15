<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects;

use InvalidArgumentException;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Support\Discovery\ClassWalker;

/**
 * The single source of truth for effect value objects: wire type → class-string.
 * Built-ins auto-register at boot; consumers register their own effects in a
 * service provider. Drives TypeScript generation and guards wire-type
 * uniqueness. It is NOT a gate for emitting — ActionResult::effect() and
 * Effects::flash() accept any Effect regardless of registration.
 */
final class EffectRegistry
{
    /**
     * @var array<string, class-string>
     */
    private array $effects = [];

    /**
     * A fresh registry holding only the package's built-in effects. Used by the
     * container binding and by TypeScript generation, both of which need the
     * built-in set independent of an application's runtime registrations.
     */
    public static function withBuiltins(): self
    {
        $registry = new self;

        foreach (ClassWalker::classes(__DIR__.'/Builtin') as $effect) {
            $registry->register($effect);
        }

        return $registry;
    }

    /**
     * @param  class-string  $effect
     */
    public function register(string $effect): void
    {
        $type = AsEffect::wireTypeForClass($effect);

        if (isset($this->effects[$type]) && $this->effects[$type] !== $effect) {
            throw new InvalidArgumentException(sprintf(
                'Effect wire type [%s] is already registered to [%s].',
                $type,
                $this->effects[$type],
            ));
        }

        $this->effects[$type] = $effect;
    }

    /**
     * @return array<string, class-string>
     */
    public function all(): array
    {
        return $this->effects;
    }
}
