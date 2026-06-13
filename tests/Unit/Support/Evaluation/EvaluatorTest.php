<?php

declare(strict_types=1);

use Illuminate\Container\Container;
use Illuminate\Http\Request;
use Lattice\Lattice\Support\Evaluation\EvaluationContext;
use Lattice\Lattice\Support\Evaluation\Evaluator;
use Lattice\Lattice\Support\Evaluation\UnresolvableEvaluationParameter;

final class EvaluatorStub
{
    public function __construct(public string $tag = 'container') {}

    public function ping(): string
    {
        return 'pong';
    }
}

beforeEach(function () {
    $this->evaluator = new Evaluator(new Container);
});

it('returns non-closures unchanged', function () {
    expect($this->evaluator->resolve('static', new EvaluationContext))->toBe('static');
});

it('injects named utilities by parameter name', function () {
    $context = (new EvaluationContext)->named('state', ['x' => 1]);

    expect($this->evaluator->resolve(fn ($state) => $state['x'], $context))->toBe(1);
});

it('injects named utilities regardless of parameter order', function () {
    $context = (new EvaluationContext)->named('a', 'A')->named('b', 'B');

    expect($this->evaluator->resolve(fn ($b, $a) => $a.$b, $context))->toBe('AB');
});

it('injects typed overrides by class', function () {
    $request = Request::create('/?q=hi');
    $context = (new EvaluationContext)->typed(Request::class, $request);

    expect($this->evaluator->resolve(fn (Request $request) => $request->query('q'), $context))->toBe('hi');
});

it('resolves unknown typed parameters from the container', function () {
    expect($this->evaluator->resolve(fn (EvaluatorStub $stub) => $stub->ping(), new EvaluationContext))->toBe('pong');
});

it('prefers a named utility over the container for a typed parameter', function () {
    $named = new EvaluatorStub('named');
    $context = (new EvaluationContext)->named('stub', $named);

    expect($this->evaluator->resolve(fn (EvaluatorStub $stub) => $stub, $context))->toBe($named);
});

it('falls back to a default value', function () {
    expect($this->evaluator->resolve(fn ($missing = 'default') => $missing, new EvaluationContext))->toBe('default');
});

it('falls back to null for a nullable parameter', function () {
    expect($this->evaluator->resolve(fn (?string $missing) => $missing, new EvaluationContext))->toBeNull();
});

it('throws for an unresolvable parameter', function () {
    $this->evaluator->resolve(fn (string $missing) => $missing, new EvaluationContext);
})->throws(UnresolvableEvaluationParameter::class);
