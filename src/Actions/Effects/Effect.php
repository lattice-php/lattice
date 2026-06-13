<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Effects;

use InvalidArgumentException;
use Lattice\Lattice\Actions\Contracts\Effect as EffectContract;
use Lattice\Lattice\Attributes\Effect as EffectAttribute;
use Spatie\Attributes\Attributes;

abstract readonly class Effect implements EffectContract
{
    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return ['type' => $this->type(), ...get_object_vars($this)];
    }

    private function type(): string
    {
        /** @var array<class-string, string> $cache */
        static $cache = [];

        return $cache[static::class] ??= self::resolveType(static::class);
    }

    /**
     * @param  class-string  $class
     */
    private static function resolveType(string $class): string
    {
        $effect = Attributes::get($class, EffectAttribute::class);

        if ($effect === null) {
            throw new InvalidArgumentException(sprintf(
                'Effect [%s] is missing the #[Effect] attribute that declares its wire type.',
                $class,
            ));
        }

        return $effect->type->value;
    }
}
