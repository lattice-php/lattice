<?php

declare(strict_types=1);

use Bambamboole\Lattice\Forms\Enums\ConditionOperator;

it('evaluates operators', function (mixed $actual, ConditionOperator $op, mixed $expected, bool $result): void {
    expect($op->evaluate($actual, $expected))->toBe($result);
})->with([
    'equals string' => ['business', ConditionOperator::Equals, 'business', true],
    'equals mismatch' => ['personal', ConditionOperator::Equals, 'business', false],
    'equals bool true' => ['1', ConditionOperator::Equals, true, true],
    'equals bool false' => ['0', ConditionOperator::Equals, true, false],
    'not equals' => ['personal', ConditionOperator::NotEquals, 'business', true],
    'gte numeric' => ['18', ConditionOperator::GreaterThanOrEqual, 18, true],
    'lt numeric' => ['17', ConditionOperator::LessThan, 18, true],
    'in' => ['free', ConditionOperator::In, ['free', 'trial'], true],
    'not in' => ['pro', ConditionOperator::NotIn, ['free', 'trial'], true],
]);
