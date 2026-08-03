<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Evaluation;

use Closure;
use Illuminate\Contracts\Container\BindingResolutionException;
use Illuminate\Contracts\Container\Container;
use ReflectionFunction;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionType;
use ReflectionUnionType;

final readonly class Evaluator
{
    /**
     * @param  list<class-string>  $nonAutowirableTypes
     */
    public function __construct(
        private Container $container,
        private array $nonAutowirableTypes = [],
    ) {}

    public function context(): EvaluationContext
    {
        return new EvaluationContext;
    }

    public function resolve(mixed $value, EvaluationContext $context): mixed
    {
        if (! $value instanceof Closure) {
            return $value;
        }

        $arguments = array_map(
            fn (ReflectionParameter $parameter): mixed => $this->resolveParameter($parameter, $context),
            new ReflectionFunction($value)->getParameters(),
        );

        return $value(...$arguments);
    }

    private function resolveParameter(ReflectionParameter $parameter, EvaluationContext $context): mixed
    {
        $name = $parameter->getName();

        if ($context->hasNamed($name)) {
            return $context->getNamed($name);
        }

        foreach ($this->typeNames($parameter->getType()) as $class) {
            if ($context->hasTyped($class)) {
                return $context->getTyped($class);
            }

            if (($assignable = $context->assignableTyped($class)) !== null) {
                return $assignable;
            }

            if ($this->isNonAutowirable($class)) {
                continue;
            }

            if (class_exists($class) || interface_exists($class) || $this->container->bound($class)) {
                try {
                    return $this->container->make($class);
                } catch (BindingResolutionException) {
                }
            }
        }

        if ($parameter->isDefaultValueAvailable()) {
            return $parameter->getDefaultValue();
        }

        if ($parameter->allowsNull()) {
            return null;
        }

        throw UnresolvableEvaluationParameter::for($parameter, $context);
    }

    /**
     * @param  class-string  $class
     */
    private function isNonAutowirable(string $class): bool
    {
        return array_any($this->nonAutowirableTypes, fn (string $base): bool => $class === $base || is_subclass_of($class, $base));
    }

    /**
     * @return list<class-string>
     */
    private function typeNames(?ReflectionType $type): array
    {
        if ($type instanceof ReflectionNamedType) {
            return $type->isBuiltin() ? [] : [$type->getName()];
        }

        if ($type instanceof ReflectionUnionType) {
            return array_values(array_filter(array_map(
                static fn (ReflectionType $member): ?string => $member instanceof ReflectionNamedType && ! $member->isBuiltin()
                    ? $member->getName()
                    : null,
                $type->getTypes(),
            )));
        }

        return [];
    }
}
