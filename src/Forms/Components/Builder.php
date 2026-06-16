<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Forms\Components\Concerns\HandlesRowSchemas;
use Lattice\Lattice\Forms\Components\Concerns\HasRowActions;
use Lattice\Lattice\Forms\Components\Concerns\HasRowLayout;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;
use Lattice\Lattice\Forms\Contracts\ProvidesRowPrefills;
use Lattice\Lattice\Forms\FormData;

#[Component('form.builder')]
class Builder extends Field implements ProvidesRowFields, ProvidesRowPrefills
{
    use HandlesRowSchemas;
    use HasRowActions;
    use HasRowLayout;

    /**
     * @var array<int, Block>
     */
    protected array $blocks = [];

    public ?int $minItems = null;

    public ?int $maxItems = null;

    public bool $reorderable = true;

    public ?string $addLabel = null;

    public int $defaultItems = 0;

    /**
     * @param  array<int, Block>  $blocks
     */
    public function blocks(array $blocks): static
    {
        $this->blocks = $blocks;

        return $this;
    }

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
     * The builder value is always an array; array-level rules live here so they
     * are not clobbered by the nested per-row rules (which use per-index keys).
     *
     * @return array<int, mixed>
     */
    #[\Override]
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
        $type = is_string($row['type'] ?? null) ? $row['type'] : null;

        foreach ($this->blocks as $block) {
            if ($block->type === $type) {
                return $block->fields();
            }
        }

        return [];
    }

    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        $rows = $data->get($this->name);
        $rows = is_array($rows) ? $rows : [];

        $rules = $this->rowRules($this->name, $rows, $data, $request);

        $types = array_map(static fn (Block $block): string => $block->type, $this->blocks);

        foreach (array_keys($rows) as $index) {
            $rules["{$this->name}.{$index}.type"] = ['required', 'in:'.implode(',', $types)];
        }

        return $rules;
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        if (! is_array($value)) {
            return [];
        }

        $cast = $this->castRows($value);
        $rows = array_values($value);

        return array_map(function ($castRow, $original) {
            if (is_array($original) && isset($original['type'])) {
                return ['type' => $original['type']] + $castRow;
            }

            return $castRow;
        }, $cast, $rows);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseBlocks(array $data): array
    {
        return [...$data, 'blocks' => $this->blocks];
    }
}
