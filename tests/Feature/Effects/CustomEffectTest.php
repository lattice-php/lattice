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

it('serializes a custom effect with its wire type and payload', function (): void {
    expect(new ConfettiEffect('gold')->jsonSerialize())
        ->toBe(['type' => 'confetti', 'color' => 'gold']);
});

it('carries a custom effect through an ActionResult', function (): void {
    $result = ActionResult::success()->effect(new ConfettiEffect('gold'));

    expect(wire($result)['effects'][0])
        ->toBe(['type' => 'confetti', 'color' => 'gold']);
});

it('registers a custom effect alongside the built-ins', function (): void {
    $registry = app(EffectRegistry::class);
    $registry->register(ConfettiEffect::class);

    expect($registry->all())->toHaveKey('confetti', ConfettiEffect::class);
});
