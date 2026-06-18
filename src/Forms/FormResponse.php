<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use BackedEnum;
use Closure;
use Illuminate\Contracts\Support\Responsable;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Core\Values\Translatable;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Facades\Effects;
use Symfony\Component\HttpFoundation\Response;

/**
 * A fluent response for a form handler: queue effects (toasts, callouts, a page
 * reload, …) and a redirect. The effects survive the redirect through the
 * `latticeEffects` flash bag, so the form flow gets the same ergonomics
 * ActionResult gives the inline action flow. Defaults to redirecting back.
 */
final readonly class FormResponse implements Responsable
{
    /**
     * @param  array<int, EffectContract>  $effects
     * @param  (Closure(): Response)|null  $redirect
     */
    private function __construct(
        private array $effects = [],
        private ?Closure $redirect = null,
    ) {}

    public static function make(): self
    {
        return new self;
    }

    public function effect(EffectContract $effect): self
    {
        return new self([...$this->effects, $effect], $this->redirect);
    }

    public function toast(string|Translatable|ToastMessage|Variant $message, Variant|string|null $variant = null): self
    {
        return $this->effect(Effect::toast($message, $variant));
    }

    public function callout(Callout $callout): self
    {
        return $this->effect(Effect::callout($callout));
    }

    public function reloadPage(): self
    {
        return $this->effect(Effect::reloadPage());
    }

    public function reloadComponent(string $component): self
    {
        return $this->effect(Effect::reloadComponent($component));
    }

    public function closeModal(?string $modal = null): self
    {
        return $this->effect(Effect::closeModal($modal));
    }

    /**
     * @param  array<string, mixed>|string  $parameters
     */
    public function toRoute(BackedEnum|string $route, array|string $parameters = []): self
    {
        $name = $route instanceof BackedEnum ? (string) $route->value : $route;

        return $this->withRedirect(fn (): Response => to_route($name, $parameters));
    }

    public function to(string $url): self
    {
        return $this->withRedirect(fn (): Response => redirect()->to($url));
    }

    public function back(): self
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

    private function withRedirect(Closure $redirect): self
    {
        return new self($this->effects, $redirect);
    }
}
