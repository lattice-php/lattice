<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Support\Evaluation\EvaluationContext;
use Lattice\Lattice\Support\Evaluation\Evaluator;
use Lattice\Lattice\Ui\Components\Component;
use UnexpectedValueException;

final class SlotRegistry
{
    /**
     * @var array<string, array<int, array{factory: Closure, priority: int, sequence: int}>>
     */
    private array $extensions = [];

    private int $sequence = 0;

    public function __construct(private readonly Evaluator $evaluator) {}

    public function extend(string $name, Closure $factory, int $priority = 0): void
    {
        $this->extensions[$name][] = [
            'factory' => $factory,
            'priority' => $priority,
            'sequence' => $this->sequence++,
        ];
    }

    /**
     * @return array<int, Component>
     */
    public function resolve(Slot $slot): array
    {
        $extensions = $this->extensions[$slot->name()] ?? [];
        $context = $this->evaluationContext($slot);

        usort(
            $extensions,
            static fn (array $left, array $right): int => [$left['priority'], $left['sequence']] <=> [$right['priority'], $right['sequence']],
        );

        return array_map(function (array $extension) use ($context, $slot): Component {
            $component = $this->evaluator->resolve($extension['factory'], $context);

            if (! $component instanceof Component) {
                throw new UnexpectedValueException(sprintf(
                    'Slot [%s] extension must return a component; [%s] returned.',
                    $slot->name(),
                    get_debug_type($component),
                ));
            }

            return clone $component;
        }, $extensions);
    }

    private function evaluationContext(Slot $slot): EvaluationContext
    {
        $context = $this->evaluator->context();

        foreach ($slot->evaluationContext() as $name => $value) {
            $context = $context->named($name, $value);

            if (is_object($value)) {
                $context = $context->typed($value::class, $value);
            }
        }

        return $context
            ->named('user', auth()->user())
            ->named('slot', $slot)
            ->typed(Slot::class, $slot)
            ->typed(Request::class, request());
    }
}
