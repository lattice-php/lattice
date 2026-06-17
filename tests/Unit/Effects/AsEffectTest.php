<?php
declare(strict_types=1);

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Enums\EffectType;

it('returns the wire type from an enum case', function (): void {
    expect(new AsEffect(EffectType::Toast)->wireType())->toBe('toast');
});

it('returns the wire type from a raw string', function (): void {
    expect(new AsEffect('confetti')->wireType())->toBe('confetti');
});
