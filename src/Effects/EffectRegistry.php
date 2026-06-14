<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects;

use InvalidArgumentException;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Spatie\Attributes\Attributes;

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
     * @param  class-string  $effect
     */
    public function register(string $effect): void
    {
        $attribute = Attributes::get($effect, AsEffect::class);

        if ($attribute === null) {
            throw new InvalidArgumentException(sprintf(
                'Effect [%s] is missing the #[AsEffect] attribute that declares its wire type.',
                $effect,
            ));
        }

        $type = $attribute->wireType();

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
