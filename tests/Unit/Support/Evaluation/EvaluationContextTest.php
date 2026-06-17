<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Support\Evaluation\EvaluationContext;

it('adds named utilities immutably', function (): void {
    $base = new EvaluationContext;
    $with = $base->named('foo', 42);

    expect($base->hasNamed('foo'))->toBeFalse()
        ->and($with->hasNamed('foo'))->toBeTrue()
        ->and($with->getNamed('foo'))->toBe(42);
});

it('stores and reads typed utilities', function (): void {
    $request = Request::create('/');
    $context = (new EvaluationContext)->typed(Request::class, $request);

    expect($context->hasTyped(Request::class))->toBeTrue()
        ->and($context->getTyped(Request::class))->toBe($request);
});

it('lists available named utility names for diagnostics', function (): void {
    $context = (new EvaluationContext)->named('a', 1)->named('b', 2);

    expect($context->names())->toBe(['a', 'b']);
});
