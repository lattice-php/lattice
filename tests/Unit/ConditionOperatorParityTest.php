<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\Conditions\ConditionEvaluator;

it('evaluates every operator identically to the client', function (string $operator, mixed $actual, mixed $expected, bool $result): void {
    $evaluator = new ConditionEvaluator;

    expect($evaluator->evaluate(Op::from($operator), $actual, $expected))->toBe($result);
})->with(function (): iterable {
    $json = (string) file_get_contents(dirname(__DIR__).'/Fixtures/condition-operator-parity.json');
    $rows = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

    if (! is_array($rows)) {
        return;
    }

    foreach ($rows as $row) {
        if (! is_array($row)) {
            continue;
        }

        yield "{$row['operator']}: ".json_encode($row['actual']).' / '.json_encode($row['expected']) => [
            (string) $row['operator'],
            $row['actual'] ?? null,
            $row['expected'] ?? null,
            (bool) ($row['result'] ?? false),
        ];
    }
});
