<?php
declare(strict_types=1);

namespace Lattice\Core\Facades;

use Illuminate\Support\Facades\Facade;
use Lattice\Core\Support\Evaluation\Evaluator;

/**
 * @method static \Lattice\Core\Support\Evaluation\EvaluationContext context()
 * @method static mixed resolve(mixed $value, \Lattice\Core\Support\Evaluation\EvaluationContext $context)
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
