<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Closure;
use Illuminate\Http\Request;
use Lattice\Core\Contracts\ContainerComponent;
use Lattice\Core\Facades\Evaluate;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Components\Concerns\CollectsSchemaFields;
use Lattice\Form\Components\Concerns\HasRowActions;
use Lattice\Form\Components\Concerns\HasRowLayout;
use Lattice\Form\Enums\FieldType;
use Lattice\Form\FormData;
use Lattice\Ui\Components\Concerns\HasChildSchema;
use Stringable;

#[AsField(FieldType::Repeater)]
class Repeater extends RowsField implements ContainerComponent
{
    use CollectsSchemaFields;
    use HasChildSchema;
    use HasRowActions;
    use HasRowLayout;

    public int $defaultItems = 1;

    public ?string $itemLabel = null;

    protected ?Closure $itemLabelResolver = null;

    /** @var list<string|null>|null */
    public ?array $itemLabels = null;

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
        return $this->collectFields($this->resolvedChildren());
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
}
