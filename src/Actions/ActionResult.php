<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use BackedEnum;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Effects\Concerns\QueuesEffects;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Enums\Variant;
use Symfony\Component\HttpFoundation\Response;

#[TypeScript]
final readonly class ActionResult
{
    use QueuesEffects;

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, Effect>  $effects
     */
    private function __construct(
        public array $data = [],
        public array $effects = [],
        private int $status = Response::HTTP_OK,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function success(array $data = []): self
    {
        return new self($data);
    }

    public static function failure(string|Translatable|null $message = null): self
    {
        $result = new self(status: Response::HTTP_UNPROCESSABLE_ENTITY);

        return $message === null ? $result : $result->toast($message, Variant::Error);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function effect(Effect $effect): static
    {
        return new self($this->data, [
            ...$this->effects,
            $effect,
        ], $this->status);
    }

    public function to(string $url): static
    {
        return $this->effect(Effects::redirect($url));
    }

    /**
     * @param  array<string, mixed>|string  $parameters
     */
    public function toRoute(BackedEnum|string $route, array|string $parameters = []): static
    {
        $name = Wire::scalar($route);

        return $this->effect(Effects::redirect(to_route($name, $parameters)->getTargetUrl()));
    }

    public function back(): static
    {
        return $this->effect(Effects::redirect(redirect()->back()->getTargetUrl()));
    }
}
