<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Evaluation;

use ReflectionParameter;
use RuntimeException;

final class UnresolvableEvaluationParameter extends RuntimeException
{
    public static function for(ReflectionParameter $parameter, EvaluationContext $context): self
    {
        $function = $parameter->getDeclaringFunction();
        $location = sprintf('%s:%d', $function->getFileName() ?: 'closure', $function->getStartLine() ?: 0);
        $available = $context->names() === [] ? '(none)' : implode(', ', $context->names());

        return new self(sprintf(
            'Cannot resolve evaluation parameter [$%s] for closure defined at %s. Available named utilities: %s. '.
            'Declare a parameter matching one of those names, a type the container can resolve, or give it a default.',
            $parameter->getName(),
            $location,
            $available,
        ));
    }
}
