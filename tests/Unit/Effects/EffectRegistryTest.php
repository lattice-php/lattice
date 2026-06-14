<?php
declare(strict_types=1);

use Lattice\Lattice\Effects\Builtin\ToastEffect;
use Lattice\Lattice\Effects\EffectRegistry;

it('registers an effect by its wire type', function () {
    $registry = new EffectRegistry;
    $registry->register(ToastEffect::class);

    expect($registry->all())->toBe(['toast' => ToastEffect::class]);
});

it('rejects a class without the AsEffect attribute', function () {
    $registry = new EffectRegistry;

    $registry->register(stdClass::class);
})->throws(InvalidArgumentException::class);

it('rejects a duplicate wire type', function () {
    $registry = new EffectRegistry;
    $registry->register(ToastEffect::class);

    $registry->register(ToastEffect::class);
})->throws(InvalidArgumentException::class);
