<?php

declare(strict_types=1);

use Bambamboole\Lattice\Forms\Conditions\Condition;
use Bambamboole\Lattice\Forms\Enums\Op;
use Bambamboole\Lattice\Forms\FormData;

it('matches against form data', function (): void {
    $condition = new Condition('type', Op::Equals, 'business');

    expect($condition->matches(FormData::make(['type' => 'business'])))->toBeTrue()
        ->and($condition->matches(FormData::make(['type' => 'personal'])))->toBeFalse();
});

it('serializes to data', function (): void {
    expect((new Condition('age', Op::GreaterThanOrEqual, 18))->jsonSerialize())
        ->toBe(['field' => 'age', 'operator' => '>=', 'value' => 18]);
});
