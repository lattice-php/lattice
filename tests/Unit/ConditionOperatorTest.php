<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\Conditions\ConditionEvaluator;

it('evaluates operators', function (mixed $actual, Op $op, mixed $expected, bool $result): void {
    expect((new ConditionEvaluator)->evaluate($op, $actual, $expected))->toBe($result);
})->with([
    'equals string' => ['business', Op::Equals, 'business', true],
    'equals mismatch' => ['personal', Op::Equals, 'business', false],
    'equals bool true' => ['1', Op::Equals, true, true],
    'equals bool false' => ['0', Op::Equals, true, false],
    'not equals' => ['personal', Op::NotEquals, 'business', true],
    'gte numeric' => ['18', Op::GreaterThanOrEqual, 18, true],
    'lt numeric' => ['17', Op::LessThan, 18, true],
    'in' => ['free', Op::In, ['free', 'trial'], true],
    'not in' => ['pro', Op::NotIn, ['free', 'trial'], true],
    'contains' => ['hello world', Op::Contains, 'world', true],
    'contains miss' => ['hello', Op::Contains, 'world', false],
    'starts with' => ['business', Op::StartsWith, 'bus', true],
    'ends with' => ['business', Op::EndsWith, 'ness', true],
    'before' => ['2024-01-01', Op::Before, '2024-06-01', true],
    'before miss' => ['2024-06-01', Op::Before, '2024-01-01', false],
    'after' => ['2024-06-01', Op::After, '2024-01-01', true],
    'after miss' => ['2024-01-01', Op::After, '2024-06-01', false],
    'before unparseable' => ['not-a-date', Op::Before, '2024-01-01', false],
    'empty on null' => [null, Op::Empty, null, true],
    'empty on blank string' => ['', Op::Empty, null, true],
    'empty on value' => ['x', Op::Empty, null, false],
    'filled on value' => ['x', Op::Filled, null, true],
    'filled on blank string' => ['', Op::Filled, null, false],
]);
