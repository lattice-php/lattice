<?php

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Components\Concerns\HasChildSchema;

#[Component('form.repeater')]
class Repeater extends Field
{
    use HasChildSchema;

    public ?int $minItems = null;

    public ?int $maxItems = null;

    public bool $reorderable = true;

    public ?string $addLabel = null;

    public ?string $itemLabel = null;

    public int $defaultItems = 1;

    public function minItems(int $min): static
    {
        $this->minItems = $min;

        return $this;
    }

    public function maxItems(int $max): static
    {
        $this->maxItems = $max;

        return $this;
    }

    public function reorderable(bool $reorderable = true): static
    {
        $this->reorderable = $reorderable;

        return $this;
    }

    public function addLabel(string $label): static
    {
        $this->addLabel = $label;

        return $this;
    }

    /**
     * Per-row heading. v1 serialises only the string form; the Closure form is
     * accepted for forward-compatible API parity and resolved in a follow-up.
     */
    public function itemLabel(string|Closure $label): static
    {
        $this->itemLabel = $label instanceof Closure ? null : $label;

        return $this;
    }

    public function defaultItems(int $count): static
    {
        $this->defaultItems = $count;

        return $this;
    }

    /**
     * @return array<int, Field>
     */
    public function childFields(): array
    {
        return array_values(array_filter(
            $this->children,
            static fn ($child): bool => $child instanceof Field,
        ));
    }
}
