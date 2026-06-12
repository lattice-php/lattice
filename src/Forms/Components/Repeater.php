<?php

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Components\Concerns\HasChildSchema;
use Lattice\Lattice\Forms\FormData;

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

    /**
     * The repeater value is always an array; array-level rules live here so they
     * are not clobbered by the nested per-row rules (which use `items.*.x` keys).
     *
     * @return array<int, mixed>
     */
    public function resolveRules(FormData $data, Request $request): array
    {
        $rules = ['array'];

        if ($this->minItems !== null) {
            $rules[] = "min:{$this->minItems}";
        }

        if ($this->maxItems !== null) {
            $rules[] = "max:{$this->maxItems}";
        }

        return $rules;
    }

    /**
     * Per-row rules: each child field's rules applied to every row via the
     * `<name>.*.<child>` wildcard. Never emits the bare `<name>` key (that would
     * overwrite resolveRules()'s array-level rules in FieldValidator).
     *
     * @return array<string, array<int, mixed>>
     */
    public function nestedRules(FormData $data, Request $request): array
    {
        $rules = [];

        foreach ($this->childFields() as $child) {
            $childRules = $child->resolvedRulesWithRequired($data, $request);

            if ($childRules !== []) {
                $rules["{$this->name}.*.{$child->name()}"] = $childRules;
            }
        }

        return $rules;
    }

    /**
     * Normalise the validated value to a re-indexed list of rows, each row's
     * cells cast through the matching child field's castValue().
     */
    public function castValue(mixed $value): mixed
    {
        if (! is_array($value)) {
            return [];
        }

        $children = $this->childFields();

        return array_values(array_map(function ($row) use ($children): array {
            $cast = [];

            foreach ($children as $child) {
                $name = $child->name();
                $cast[$name] = $child->castValue(is_array($row) ? ($row[$name] ?? null) : null);
            }

            return $cast;
        }, $value));
    }
}
