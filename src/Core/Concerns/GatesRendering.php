<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

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

    private ?bool $resolvedVisibility = null;

    public function visible(Closure|bool $condition = true): static
    {
        $this->visibleCondition = $condition;
        $this->resolvedVisibility = null;

        return $this;
    }

    public function hidden(Closure|bool $condition = true): static
    {
        $this->visibleCondition = $condition instanceof Closure
            ? fn (): bool => ! (bool) app(Evaluator::class)->resolve($condition, $this->renderContext())
            : ! $condition;
        $this->resolvedVisibility = null;

        return $this;
    }

    public function shouldRender(): bool
    {
        return $this->resolvedVisibility ??= $this->visibleCondition instanceof Closure
            ? (bool) app(Evaluator::class)->resolve($this->visibleCondition, $this->renderContext())
            : $this->visibleCondition;
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
