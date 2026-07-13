<?php
declare(strict_types=1);

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Effects\EffectRegistry;

#[AsEffect('toast')]
final class ConflictingToastEffect extends Effect {}

it('registers an effect by its wire type', function (): void {
    $registry = new EffectRegistry;
    $registry->register(Toast::class);

    expect($registry->all())->toBe(['toast' => Toast::class]);
});

it('rejects a class without the AsEffect attribute', function (): void {
    $registry = new EffectRegistry;

    $registry->register(stdClass::class);
})->throws(InvalidArgumentException::class);

it('rejects a different class claiming an already-used wire type', function (): void {
    $registry = new EffectRegistry;
    $registry->register(Toast::class);

    $registry->register(ConflictingToastEffect::class);
})->throws(InvalidArgumentException::class);

it('re-registering the same class is a silent no-op', function (): void {
    $registry = new EffectRegistry;
    $registry->register(Toast::class);
    $registry->register(Toast::class);

    expect($registry->all())->toBe(['toast' => Toast::class]);
});
