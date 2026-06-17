<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Evaluate;

it('resolves a closure through the facade', function (): void {
    $context = Evaluate::context()->named('state', 7);

    expect(Evaluate::resolve(fn ($state): int|float => $state * 2, $context))->toBe(14);
});

it('passes a non-closure through the facade unchanged', function (): void {
    expect(Evaluate::resolve('plain', Evaluate::context()))->toBe('plain');
});
