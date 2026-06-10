<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Enums\ConditionOperator;

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
    'contains' => ['hello world', ConditionOperator::Contains, 'world', true],
    'contains miss' => ['hello', ConditionOperator::Contains, 'world', false],
    'starts with' => ['business', ConditionOperator::StartsWith, 'bus', true],
    'ends with' => ['business', ConditionOperator::EndsWith, 'ness', true],
    'empty on null' => [null, ConditionOperator::Empty, null, true],
    'empty on blank string' => ['', ConditionOperator::Empty, null, true],
    'empty on value' => ['x', ConditionOperator::Empty, null, false],
    'filled on value' => ['x', ConditionOperator::Filled, null, true],
    'filled on blank string' => ['', ConditionOperator::Filled, null, false],
]);
