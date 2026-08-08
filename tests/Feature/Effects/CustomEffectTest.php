<?php
declare(strict_types=1);

use Lattice\Actions\ActionResult;
use Lattice\Ui\Effects\Attributes\AsEffect;
use Lattice\Ui\Effects\Effect;
use Lattice\Ui\Effects\EffectRegistry;

#[AsEffect('confetti')]
final class ConfettiEffect extends Effect
{
    public function __construct(public string $color) {}
}

it('carries a custom effect through an ActionResult', function (): void {
    $result = ActionResult::success()->effect(new ConfettiEffect('gold'));

    expect(wire($result)['effects'][0])
        ->toBe(['type' => 'confetti', 'props' => ['color' => 'gold']]);
});

it('registers a custom effect alongside the built-ins', function (): void {
    $registry = app(EffectRegistry::class);
    $registry->register(ConfettiEffect::class);

    expect($registry->all())->toHaveKey('confetti', ConfettiEffect::class);
});
