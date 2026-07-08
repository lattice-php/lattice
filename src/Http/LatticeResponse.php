<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

use BackedEnum;
use Closure;
use Illuminate\Contracts\Support\Responsable;
use Lattice\Lattice\Effects\Concerns\QueuesEffects;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\Support\Wire;
use Symfony\Component\HttpFoundation\Response;

/**
 * A fluent, Responsable result for any endpoint — a controller, a form handler,
 * anywhere: queue effects (toasts, callouts, a component or page reload, a
 * modal close, …) and a redirect. The effects survive the redirect through the
 * `latticeEffects` flash bag, giving plain controllers the same ergonomics
 * ActionResult gives actions. Defaults to redirecting back.
 *
 * @phpstan-consistent-constructor
 */
readonly class LatticeResponse implements Responsable
{
    use QueuesEffects;

    /**
     * @param  array<int, EffectContract>  $effects
     * @param  (Closure(): Response)|null  $redirect
     */
    protected function __construct(
        private array $effects = [],
        private ?Closure $redirect = null,
    ) {}

    public static function make(): static
    {
        return new static;
    }

    public function effect(EffectContract $effect): static
    {
        return new static([...$this->effects, $effect], $this->redirect);
    }

    /**
     * @param  array<string, mixed>|string  $parameters
     */
    public function toRoute(BackedEnum|string $route, array|string $parameters = []): static
    {
        $name = Wire::scalar($route);

        return $this->withRedirect(fn (): Response => to_route($name, $parameters));
    }

    public function to(string $url): static
    {
        return $this->withRedirect(fn (): Response => redirect()->to($url));
    }

    public function back(): static
    {
        return $this->withRedirect(fn (): Response => redirect()->back());
    }

    public function toResponse($request): Response
    {
        if ($this->effects !== []) {
            Effects::flash(...$this->effects);
        }

        return ($this->redirect ?? fn (): Response => redirect()->back())();
    }

    private function withRedirect(Closure $redirect): static
    {
        return new static($this->effects, $redirect);
    }
}
