<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Effects\EffectRegistry;

#[AsEffect('confetti')]
final readonly class ConfettiEffect extends Effect
{
    public function __construct(public string $color) {}
}

it('serializes a custom effect with its wire type and payload', function () {
    expect((new ConfettiEffect('gold'))->jsonSerialize())
        ->toBe(['type' => 'confetti', 'color' => 'gold']);
});

it('carries a custom effect through an ActionResult', function () {
    $result = ActionResult::success()->effect(new ConfettiEffect('gold'));

    expect($result->jsonSerialize()['effects'][0]->jsonSerialize())
        ->toBe(['type' => 'confetti', 'color' => 'gold']);
});

it('registers a custom effect alongside the built-ins', function () {
    $registry = app(EffectRegistry::class);
    $registry->register(ConfettiEffect::class);

    expect($registry->all())->toHaveKey('confetti', ConfettiEffect::class);
});
