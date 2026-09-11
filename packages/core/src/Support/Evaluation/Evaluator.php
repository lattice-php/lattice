<?php

declare(strict_types=1);

namespace Lattice\Core\Support\Evaluation;

use Closure;
use Illuminate\Container\Container;
use Illuminate\Contracts\Container\BindingResolutionException;
use ReflectionFunction;
use ReflectionNamedType;
use ReflectionParameter;
use ReflectionType;
use ReflectionUnionType;

/**
 * Autowires through the container that is current when a closure is evaluated,
 * never one captured at construction: the evaluator is a singleton built at
 * boot, and a long-running worker such as Octane serves each request from a
 * cloned container it makes current, so the boot container would hand out an
 * earlier request's scoped services.
 */
final readonly class Evaluator
{
    /**
     * @param  list<class-string>  $nonAutowirableTypes
     */
    public function __construct(private array $nonAutowirableTypes = []) {}

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

            $container = Container::getInstance();

            if (class_exists($class) || interface_exists($class) || $container->bound($class)) {
                try {
                    return $container->make($class);
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
            $name = $type->isBuiltin() ? null : $type->getName();

            return $name !== null && (class_exists($name) || interface_exists($name)) ? [$name] : [];
        }

        if ($type instanceof ReflectionUnionType) {
            return array_values(array_filter(array_map(
                static function (ReflectionType $member): ?string {
                    if (! $member instanceof ReflectionNamedType || $member->isBuiltin()) {
                        return null;
                    }

                    $name = $member->getName();

                    return class_exists($name) || interface_exists($name) ? $name : null;
                },
                $type->getTypes(),
            )));
        }

        return [];
    }
}
