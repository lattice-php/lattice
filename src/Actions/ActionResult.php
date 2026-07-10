<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use BackedEnum;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Effects\Concerns\QueuesEffects;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Support\Wire;

#[TypeScript]
final readonly class ActionResult
{
    use QueuesEffects;

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, EffectContract>  $effects
     */
    private function __construct(
        public bool $ok,
        public array $data = [],
        public array $effects = [],
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function success(array $data = []): self
    {
        return new self(true, $data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function failure(array $data = []): self
    {
        return new self(false, $data);
    }

    public function effect(EffectContract $effect): static
    {
        return new self($this->ok, $this->data, [
            ...$this->effects,
            $effect,
        ]);
    }

    public function to(string $url): static
    {
        return $this->effect(Effect::redirect($url));
    }

    /**
     * @param  array<string, mixed>|string  $parameters
     */
    public function toRoute(BackedEnum|string $route, array|string $parameters = []): static
    {
        $name = Wire::scalar($route);

        return $this->effect(Effect::redirect(to_route($name, $parameters)->getTargetUrl()));
    }

    public function back(): static
    {
        return $this->effect(Effect::redirect(redirect()->back()->getTargetUrl()));
    }
}
