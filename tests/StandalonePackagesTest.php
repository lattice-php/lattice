<?php

declare(strict_types=1);

namespace Lattice\Tests;

use BadMethodCallException;
use Lattice\Core\Facades\Evaluate;
use Lattice\Core\Facades\Lattice;

uses(StandalonePackagesTestCase::class);

it('boots the standalone package stack without the umbrella package', function (): void {
    Lattice::forms([]);
    Lattice::tables([]);
    Lattice::extend('fixture', fn (): null => null);

    expect(Evaluate::resolve(fn (): string => 'resolved', Evaluate::context()))->toBe('resolved')
        ->and($this->postJson('/lattice/refs/refresh')->status())->toBe(403)
        ->and($this->postJson('/lattice/forms/missing')->status())->toBe(403)
        ->and($this->getJson('/lattice/tables/missing')->status())->toBe(403)
        ->and(fn () => Lattice::actions([]))
        ->toThrow(BadMethodCallException::class, 'Lattice capability [actions] is not registered.');
});
