<?php
declare(strict_types=1);

namespace Lattice\Http;

use BackedEnum;
use Closure;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Lattice\Core\Support\Wire;
use Lattice\Facades\Effects;
use Lattice\Ui\Effects\Builtin\Redirect;
use Lattice\Ui\Effects\Concerns\QueuesEffects;
use Lattice\Ui\Effects\Effect;
use Symfony\Component\HttpFoundation\Response;

/**
 * A fluent, Responsable result for any endpoint — a controller, a form handler,
 * anywhere: queue effects (toasts, callouts, a component or page reload, a
 * modal close, …) and a redirect. The effects survive the redirect through the
 * `latticeEffects` flash bag, giving plain controllers the same ergonomics
 * ActionResult gives actions. Defaults to redirecting back.
 *
 * A plain JSON request (no `X-Inertia` header — an async form submit, a raw
 * fetch) gets the effects as a JSON body instead, in the shape the action
 * effect dispatcher already consumes; an explicit redirect travels along as a
 * redirect effect, so `toRoute()` navigates in both worlds.
 *
 * @phpstan-consistent-constructor
 */
readonly class LatticeResponse implements Responsable
{
    use QueuesEffects;

    /**
     * @param  array<int, Effect>  $effects
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

    public function effect(Effect $effect): static
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
        if ($this->wantsEffectsJson($request)) {
            return new JsonResponse(['effects' => [...$this->effects, ...$this->redirectEffect()]]);
        }

        if ($this->effects !== []) {
            Effects::flash(...$this->effects);
        }

        return ($this->redirect ?? fn (): Response => redirect()->back())();
    }

    private function wantsEffectsJson(Request $request): bool
    {
        return ! $request->headers->has('X-Inertia') && $request->expectsJson();
    }

    /**
     * The default back() is deliberately not carried over: a fetch client that
     * asked for JSON has nowhere to go "back" to — staying on the page is the
     * point of submitting asynchronously.
     *
     * @return array<int, Effect>
     */
    private function redirectEffect(): array
    {
        if (! $this->redirect instanceof Closure) {
            return [];
        }

        $response = ($this->redirect)();

        return $response instanceof RedirectResponse ? [new Redirect($response->getTargetUrl())] : [];
    }

    private function withRedirect(Closure $redirect): static
    {
        return new static($this->effects, $redirect);
    }
}
