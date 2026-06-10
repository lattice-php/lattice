<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Conditions\Condition;
use Lattice\Lattice\Forms\Enums\ConditionOperator;
use Lattice\Lattice\Forms\FormData;

it('matches against form data', function (): void {
    $condition = new Condition('type', ConditionOperator::Equals, 'business');

    expect($condition->matches(FormData::make(['type' => 'business'])))->toBeTrue()
        ->and($condition->matches(FormData::make(['type' => 'personal'])))->toBeFalse();
});

it('serializes to data', function (): void {
    expect((new Condition('age', ConditionOperator::GreaterThanOrEqual, 18))->jsonSerialize())
        ->toBe(['field' => 'age', 'operator' => 'gte', 'value' => 18]);
});
