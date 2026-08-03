<?php
declare(strict_types=1);

namespace Lattice\Lattice\Facades;

use Illuminate\Support\Facades\Facade;
use Lattice\Lattice\Support\Evaluation\Evaluator;

/**
 * @method static \Lattice\Lattice\Support\Evaluation\EvaluationContext context()
 * @method static mixed resolve(mixed $value, \Lattice\Lattice\Support\Evaluation\EvaluationContext $context)
 *
 * @see Evaluator
 */
final class Evaluate extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return Evaluator::class;
    }
}
