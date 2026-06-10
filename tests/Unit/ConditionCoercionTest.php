<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Enums\ConditionOperator;

it('coerces condition booleans identically to the client', function (mixed $actual, bool $expected, bool $result): void {
    expect(ConditionOperator::Equals->evaluate($actual, $expected))->toBe($result);
    expect(ConditionOperator::NotEquals->evaluate($actual, $expected))->toBe(! $result);
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
