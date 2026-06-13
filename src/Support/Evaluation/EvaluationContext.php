<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Evaluation;

final class EvaluationContext
{
    /**
     * @param  array<string, mixed>  $named
     * @param  array<class-string, object>  $typed
     */
    public function __construct(
        private array $named = [],
        private array $typed = [],
    ) {}

    public function named(string $name, mixed $value): self
    {
        return new self([...$this->named, $name => $value], $this->typed);
    }

    /**
     * @param  class-string  $class
     */
    public function typed(string $class, object $value): self
    {
        return new self($this->named, [...$this->typed, $class => $value]);
    }

    public function hasNamed(string $name): bool
    {
        return array_key_exists($name, $this->named);
    }

    public function getNamed(string $name): mixed
    {
        return $this->named[$name];
    }

    /**
     * @param  class-string  $class
     */
    public function hasTyped(string $class): bool
    {
        return array_key_exists($class, $this->typed);
    }

    /**
     * @param  class-string  $class
     */
    public function getTyped(string $class): object
    {
        return $this->typed[$class];
    }

    /**
     * The first registered typed utility that is an instance of the given type,
     * or null. Enables resolving a parameter typed as a supertype to a registered
     * subtype (DI contravariance).
     *
     * @param  class-string  $class
     */
    public function assignableTyped(string $class): ?object
    {
        foreach ($this->typed as $value) {
            if ($value instanceof $class) {
                return $value;
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    public function names(): array
    {
        return array_keys($this->named);
    }
}
