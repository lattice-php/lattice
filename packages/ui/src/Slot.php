<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui;

use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;

final class Slot implements SchemaEntry
{
    /**
     * @var array<string, mixed>
     */
    private array $context = [];

    /**
     * @var array<int, Component>|null
     */
    private ?array $resolvedComponents = null;

    private function __construct(private readonly string $name) {}

    public static function make(string $name): self
    {
        return new self($name);
    }

    public function name(): string
    {
        return $this->name;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public function context(array $context): self
    {
        $this->context = $context;
        $this->resolvedComponents = null;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function evaluationContext(): array
    {
        return $this->context;
    }

    /**
     * @return array<int, Component>
     */
    public function resolveComponents(): array
    {
        return $this->resolvedComponents ??= app(SlotRegistry::class)->resolve($this);
    }
}
