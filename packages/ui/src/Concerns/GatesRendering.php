<?php
declare(strict_types=1);

namespace Lattice\Ui\Concerns;

use BackedEnum;
use Closure;
use Illuminate\Http\Request;
use Lattice\Core\Authorization;
use Lattice\Core\Support\Evaluation\EvaluationContext;
use Lattice\Core\Support\Evaluation\Evaluator;

/**
 * The single server-side render gate: a node that should not render is dropped
 * by its parent's collection pass (FiltersRenderableComponents) and never
 * serializes. Closures resolve lazily, once, against a request-scoped context —
 * no form or row state exists at render time. Some adopters resolve the gate at
 * set-time instead of collect-time (e.g. Table::filters(), TableDefinition::actions()
 * row actions), filtering with the same shouldRender() check at the seam where the
 * value is embedded rather than in a shared collection pass.
 */
trait GatesRendering
{
    private Closure|bool $visibleCondition = true;

    private bool $negatesCondition = false;

    private ?bool $resolvedVisibility = null;

    /**
     * @var array<int, string>
     */
    private array $can = [];

    /**
     * The permission half of the gate, spelled the same `can` as the attribute
     * on a definition or page. Checked in addition to visible()/hidden() and
     * never widened by them, so the order of the calls does not matter.
     *
     * @param  string|BackedEnum|array<int, string|BackedEnum>  $can
     */
    public function can(string|BackedEnum|array $can): static
    {
        $this->can = [...$this->can, ...Authorization::abilities($can)];
        $this->resolvedVisibility = null;

        return $this;
    }

    public function visible(Closure|bool $condition = true): static
    {
        $this->visibleCondition = $condition;
        $this->negatesCondition = false;
        $this->resolvedVisibility = null;

        return $this;
    }

    public function hidden(Closure|bool $condition = true): static
    {
        $this->visibleCondition = $condition;
        $this->negatesCondition = true;
        $this->resolvedVisibility = null;

        return $this;
    }

    public function shouldRender(): bool
    {
        if ($this->resolvedVisibility === null) {
            $this->resolvedVisibility = $this->passesAuthorization() && $this->passesVisibleCondition();
        }

        return $this->resolvedVisibility;
    }

    private function passesAuthorization(): bool
    {
        if ($this->can === []) {
            return true;
        }

        return Authorization::allows($this->can, request());
    }

    private function passesVisibleCondition(): bool
    {
        $condition = $this->visibleCondition instanceof Closure
            ? (bool) app(Evaluator::class)->resolve($this->visibleCondition, $this->renderContext())
            : $this->visibleCondition;

        return $this->negatesCondition ? ! $condition : $condition;
    }

    protected function renderContext(): EvaluationContext
    {
        return app(Evaluator::class)->context()
            ->named('component', $this)
            ->named('user', auth()->user())
            ->typed(static::class, $this)
            ->typed(Request::class, request());
    }
}
