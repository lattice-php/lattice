<?php
declare(strict_types=1);

use Lattice\Core\Enums\Op;
use Lattice\Form\Conditions\Condition;
use Lattice\Form\FormData;

it('matches against form data', function (): void {
    $condition = new Condition('type', Op::Equals, 'business');

    expect($condition->matches(FormData::make(['type' => 'business'])))->toBeTrue()
        ->and($condition->matches(FormData::make(['type' => 'personal'])))->toBeFalse();
});

it('serializes to data', function (): void {
    expect(wire(new Condition('age', Op::GreaterThanOrEqual, 18)))
        ->toBe(['field' => 'age', 'operator' => 'gte', 'value' => 18]);
});
