<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Components\Concerns\HasChildSchema;
use Lattice\Lattice\Forms\Components\Concerns\HandlesRowSchemas;
use Lattice\Lattice\Forms\Components\Concerns\HasRowActions;
use Lattice\Lattice\Forms\Components\Concerns\HasRowLayout;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;
use Lattice\Lattice\Forms\Contracts\ProvidesRowPrefills;
use Lattice\Lattice\Forms\FormData;

#[Component('form.repeater')]
class Repeater extends Field implements ProvidesRowFields, ProvidesRowPrefills
{
    use HandlesRowSchemas;
    use HasChildSchema;
    use HasRowActions;
    use HasRowLayout;

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
     * are not clobbered by the nested per-row rules (which use per-index keys).
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
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    protected function rowFields(array $row): array
    {
        return $this->childFields();
    }

    public function nestedRules(FormData $data, Request $request): array
    {
        $rows = $data->get($this->name);
        $rows = is_array($rows) ? $rows : [];

        return $this->rowRules($this->name, $rows, $data, $request);
    }

    public function castValue(mixed $value): mixed
    {
        return $this->castRows($value);
    }
}
