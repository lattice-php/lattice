<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Concerns\HasChildSchema;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Components\Concerns\HasRowActions;
use Lattice\Lattice\Forms\Components\Concerns\HasRowLayout;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\FormData;
use Stringable;

#[AsField(FieldType::Repeater)]
class Repeater extends RowsField
{
    use HasChildSchema;
    use HasRowActions;
    use HasRowLayout;

    public int $defaultItems = 1;

    public ?string $itemLabel = null;

    protected ?Closure $itemLabelResolver = null;

    /**
     * @var list<string|null>|null
     */
    protected ?array $itemLabels = null;

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

    /**
     * @return array<int, Field>
     */
    public function childFields(): array
    {
        return array_values(array_filter(
            $this->children,
            static fn (Component $child): bool => $child instanceof Field,
        ));
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    public function rowFields(array $row): array
    {
        return $this->childFields();
    }

    #[\Override]
    public function hydrateState(mixed $value, ?FormData $form = null, ?Request $request = null): void
    {
        if (! $this->itemLabelResolver instanceof Closure || ! is_array($value)) {
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
