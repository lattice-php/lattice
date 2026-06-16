<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Components\Concerns\HasChildSchema;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Components\Concerns\HandlesRowSchemas;
use Lattice\Lattice\Forms\Components\Concerns\HasRowActions;
use Lattice\Lattice\Forms\Components\Concerns\HasRowLayout;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;
use Lattice\Lattice\Forms\Contracts\ProvidesRowPrefills;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\FormData;
use Stringable;

#[AsField(FieldType::Repeater)]
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

    protected ?Closure $itemLabelResolver = null;

    /**
     * @var list<string|null>|null
     */
    protected ?array $itemLabels = null;

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

    public function itemLabel(string|Closure $label): static
    {
        if ($label instanceof Closure) {
            $this->itemLabel = null;
            $this->itemLabelResolver = $label;

            return $this;
        }

        $this->itemLabel = $label;
        $this->itemLabelResolver = null;

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
        return $this->childFields();
    }

    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        $rows = $data->get($this->name);
        $rows = is_array($rows) ? $rows : [];

        return $this->rowRules($this->name, $rows, $data, $request);
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        return $this->castRows($value);
    }

    #[\Override]
    public function hydrateState(mixed $value, ?FormData $form = null, ?Request $request = null): void
    {
        if ($this->itemLabelResolver === null || ! is_array($value)) {
            $this->itemLabels = null;

            return;
        }

        $form ??= FormData::make([]);
        $request ??= request();

        $this->itemLabels = array_map(function (mixed $row) use ($form, $request): ?string {
            $row = is_array($row) ? $row : [];
            $rowData = FormData::make($row);
            $label = Evaluate::resolve(
                $this->itemLabelResolver,
                $this->evaluationContext($rowData, $request)
                    ->named('row', $rowData)
                    ->named('form', $form),
            );

            return is_scalar($label) || $label instanceof Stringable ? (string) $label : null;
        }, array_values($value));
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        if ($this->itemLabels === null) {
            return parent::decorateProps($props);
        }

        return parent::decorateProps([...$props, 'itemLabels' => $this->itemLabels]);
    }
}
