<?php

declare(strict_types=1);

namespace Lattice\Support\Testing\Assertions;

use Closure;
use PHPUnit\Framework\Assert;

/**
 * The effects a response flashed through the `latticeEffects` bag, as the
 * plain arrays the client drains — a redirect that carries a toast, a callout
 * raised by middleware, a component reload requested from a listener.
 */
final readonly class EffectAssertions
{
    /**
     * @param  list<array<string, mixed>>  $effects
     */
    public function __construct(private array $effects) {}

    /**
     * @param  (Closure(array<string, mixed>): mixed)|null  $tap  Receives the effect's props.
     */
    public function assertFlashed(string $type, ?Closure $tap = null): self
    {
        $props = $this->props($type);

        Assert::assertNotNull($props, sprintf(
            'Lattice effect [%s] was not flashed. Flashed: [%s].',
            $type,
            implode(', ', $this->types()) ?: 'none',
        ));

        if ($tap instanceof Closure) {
            $tap($props);
        }

        return $this;
    }

    public function assertNotFlashed(string $type): self
    {
        Assert::assertNull($this->props($type), sprintf('Lattice effect [%s] was flashed unexpectedly.', $type));

        return $this;
    }

    public function assertNothingFlashed(): self
    {
        Assert::assertSame([], $this->effects, sprintf(
            'Expected no Lattice effects, got [%s].',
            implode(', ', $this->types()),
        ));

        return $this;
    }

    /**
     * The props of the first effect of this type, or null when none was flashed.
     *
     * @return array<string, mixed>|null
     */
    public function props(string $type): ?array
    {
        foreach ($this->effects as $effect) {
            if (($effect['type'] ?? null) === $type) {
                $props = $effect['props'] ?? [];

                return is_array($props) ? $props : [];
            }
        }

        return null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function all(): array
    {
        return $this->effects;
    }

    /**
     * @return list<string>
     */
    public function types(): array
    {
        return array_values(array_filter(array_map(
            static fn (array $effect): mixed => $effect['type'] ?? null,
            $this->effects,
        ), is_string(...)));
    }
}
