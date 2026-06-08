<?php

declare(strict_types=1);

use Bambamboole\Lattice\Forms\Conditions\Op;

it('evaluates operators', function (mixed $actual, Op $op, mixed $expected, bool $result): void {
    expect($op->evaluate($actual, $expected))->toBe($result);
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
]);
