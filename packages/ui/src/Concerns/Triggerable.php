<?php

declare(strict_types=1);

namespace Lattice\Ui\Concerns;

use Closure;
use InvalidArgumentException;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Facades\Evaluate;
use Lattice\Core\Services\ContextScope;
use Lattice\Core\Support\Evaluation\EvaluationContext;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Effects\Effect;

/**
 * The shared click surface for clickable components (Link, Button, MenuItem): a
 * label plus exactly one behavior — navigate to an `href`, run a server `action`,
 * dispatch client `effects`, or embed a `modal`. The four are mutually exclusive.
 */
trait Triggerable
{
    use HasHttpMethod;
    use HasLabel;

    abstract protected function renderContext(): EvaluationContext;

    public ?string $href = null;

    public ?Component $action = null;

    /** @var array<int, Effect> */
    public array $effects = [];

    public ?Modal $modal = null;

    protected ?Closure $modalResolver = null;

    /** @var array<string, mixed>|null */
    protected ?array $modalContextFrame = null;

    public function href(string $href): static
    {
        $this->assertBehaviorAllowed('href');

        $this->href = $href;

        return $this;
    }

    /**
     * @param  class-string  $actionClass
     * @param  array<string, mixed>  $context
     */
    public function action(string $actionClass, array $context = []): static
    {
        $this->assertBehaviorAllowed('action');

        /** @var callable(class-string, array<string, mixed>): Component $resolve */
        $resolve = app('lattice.actions.component');
        $this->action = $resolve($actionClass, $context);

        return $this;
    }

    public function effects(Effect ...$effects): static
    {
        $this->assertBehaviorAllowed('effects');

        $this->effects = array_values($effects);

        return $this;
    }

    /**
     * A closure form snapshots the currently inherited `ContextScope` frame
     * at call time — the row/definition frame it was built inside — and
     * replays it around the closure in {@see resolveEmbeddedModal()}, which
     * runs later from a `#[SerializationHook]` once that frame has already
     * popped.
     */
    public function modal(Modal|Closure $modal): static
    {
        $this->assertBehaviorAllowed('modal');

        if ($modal instanceof Modal) {
            $this->modal = $modal;
            $this->modalResolver = null;
            $this->modalContextFrame = null;
        } else {
            $this->modalResolver = $modal;
            $this->modal = null;
            $this->modalContextFrame = app(ContextScope::class)->snapshot();
        }

        return $this;
    }

    /**
     * A clickable carries exactly one behavior. Re-setting the same one is fine;
     * mixing an href, an action, effects, and a modal is not.
     */
    protected function assertBehaviorAllowed(string $incoming): void
    {
        $set = array_keys(array_filter([
            'href' => $this->href !== null,
            'action' => $this->action !== null,
            'effects' => $this->effects !== [],
            'modal' => $this->modal !== null || $this->modalResolver instanceof Closure,
        ]));

        if (array_diff($set, [$incoming]) !== []) {
            throw new InvalidArgumentException('A clickable component can carry only one of an href, an action, effects, or a modal.');
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function resolveEmbeddedModal(array $data): array
    {
        if ($this->modalResolver instanceof Closure) {
            $resolved = app(ContextScope::class)->within(
                $this->modalContextFrame ?? [],
                fn (): mixed => Evaluate::resolve($this->modalResolver, $this->renderContext()),
            );

            if (! $resolved instanceof Modal) {
                throw new InvalidArgumentException('The modal() closure must return a Modal instance.');
            }

            $this->modal = $resolved;
        }

        if ($this->modal instanceof Modal && ! $this->modal->shouldRender()) {
            // An embedded modal never sits in a schema array, so it bypasses the
            // usual collect-time FiltersRenderableComponents pass; strip it here
            // instead, mirroring Action::stripUnauthorizedForm, or it throws at
            // jsonSerialize() once shouldRender() is false.
            $this->modal = null;
        }

        return $data;
    }
}
