<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\Conditions\ConditionEvaluator;

it('coerces condition booleans identically to the client', function (mixed $actual, bool $expected, bool $result): void {
    $evaluator = new ConditionEvaluator;

    expect($evaluator->evaluate(Op::Equals, $actual, $expected))->toBe($result);
    expect($evaluator->evaluate(Op::NotEquals, $actual, $expected))->toBe(! $result);
})->with(function (): iterable {
    $json = (string) file_get_contents(dirname(__DIR__).'/Fixtures/condition-boolean-coercion.json');
    $rows = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

    if (! is_array($rows)) {
        return;
    }

    foreach ($rows as $row) {
        if (! is_array($row)) {
            continue;
        }

        yield [$row['actual'] ?? null, (bool) ($row['expected'] ?? false), (bool) ($row['result'] ?? false)];
    }
});
