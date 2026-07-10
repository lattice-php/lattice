<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Support\Evaluation\EvaluationContext;
use Lattice\Lattice\Support\Evaluation\Evaluator;

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
            $condition = $this->visibleCondition instanceof Closure
                ? (bool) app(Evaluator::class)->resolve($this->visibleCondition, $this->renderContext())
                : $this->visibleCondition;

            $this->resolvedVisibility = $this->negatesCondition ? ! $condition : $condition;
        }

        return $this->resolvedVisibility;
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
