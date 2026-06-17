<?php

declare(strict_types=1);

use Illuminate\Container\Container;
use Illuminate\Http\Request;
use Lattice\Lattice\Support\Evaluation\EvaluationContext;
use Lattice\Lattice\Support\Evaluation\Evaluator;
use Lattice\Lattice\Support\Evaluation\UnresolvableEvaluationParameter;

interface PingableStub {}

final class EvaluatorStub implements PingableStub
{
    public function __construct(public string $tag = 'container') {}

    public function ping(): string
    {
        return 'pong';
    }
}

interface UnboundEvaluatorContract {}

beforeEach(function (): void {
    $this->evaluator = new Evaluator(new Container);
});

it('returns non-closures unchanged', function (): void {
    expect($this->evaluator->resolve('static', new EvaluationContext))->toBe('static');
});

it('injects named utilities by parameter name', function (): void {
    $context = (new EvaluationContext)->named('state', ['x' => 1]);

    expect($this->evaluator->resolve(fn ($state) => $state['x'], $context))->toBe(1);
});

it('injects named utilities regardless of parameter order', function (): void {
    $context = (new EvaluationContext)->named('a', 'A')->named('b', 'B');

    expect($this->evaluator->resolve(fn ($b, $a): string => $a.$b, $context))->toBe('AB');
});

it('injects typed overrides by class', function (): void {
    $request = Request::create('/?q=hi');
    $context = (new EvaluationContext)->typed(Request::class, $request);

    expect($this->evaluator->resolve(fn (Request $request) => $request->query('q'), $context))->toBe('hi');
});

it('resolves unknown typed parameters from the container', function (): void {
    expect($this->evaluator->resolve(fn (EvaluatorStub $stub): string => $stub->ping(), new EvaluationContext))->toBe('pong');
});

it('prefers a named utility over the container for a typed parameter', function (): void {
    $named = new EvaluatorStub('named');
    $context = (new EvaluationContext)->named('stub', $named);

    expect($this->evaluator->resolve(fn (EvaluatorStub $stub): EvaluatorStub => $stub, $context))->toBe($named);
});

it('falls back to a default value', function (): void {
    expect($this->evaluator->resolve(fn ($missing = 'default') => $missing, new EvaluationContext))->toBe('default');
});

it('falls back to null for a nullable parameter', function (): void {
    expect($this->evaluator->resolve(fn (?string $missing): ?string => $missing, new EvaluationContext))->toBeNull();
});

it('throws for an unresolvable parameter', function (): void {
    $this->evaluator->resolve(fn (string $missing): string => $missing, new EvaluationContext);
})->throws(UnresolvableEvaluationParameter::class);

it('throws a domain exception when a typed parameter is an unbound interface', function (): void {
    $this->evaluator->resolve(fn (UnboundEvaluatorContract $service): UnboundEvaluatorContract => $service, new EvaluationContext);
})->throws(UnresolvableEvaluationParameter::class);

it('resolves a typed parameter to an assignable context utility (contravariance)', function (): void {
    $stub = new EvaluatorStub('assignable');
    $context = (new EvaluationContext)->typed(EvaluatorStub::class, $stub);

    expect($this->evaluator->resolve(fn (PingableStub $service): PingableStub => $service, $context))->toBe($stub);
});

it('does not autowire a non-autowirable base type and throws instead', function (): void {
    $evaluator = new Evaluator(new Container, [EvaluatorStub::class]);

    $evaluator->resolve(fn (EvaluatorStub $stub): EvaluatorStub => $stub, new EvaluationContext);
})->throws(UnresolvableEvaluationParameter::class);

it('resolves a non-autowirable type when it is provided via the context', function (): void {
    $evaluator = new Evaluator(new Container, [EvaluatorStub::class]);
    $stub = new EvaluatorStub('provided');
    $context = (new EvaluationContext)->typed(EvaluatorStub::class, $stub);

    expect($evaluator->resolve(fn (EvaluatorStub $stub): EvaluatorStub => $stub, $context))->toBe($stub);
});
