<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Validation\Rule;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Concerns\FiltersRenderableComponents;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasOptions;
use Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::Choice)]
class Choice extends Field
{
    use FiltersRenderableComponents;
    use HasAutoFocus;
    use HasOptions;
    use HasTabIndex;

    /** @var list<Component>|null */
    public ?array $optionSchema = null;

    /**
     * Render each option as a card built from a schema of bound components
     * instead of a label-only pill. Components bind option fields with
     * `->dataKey($prop, $key)`; bindings resolve against the option's `data`
     * record plus its `label` and `value`. The schema ships once on the wire —
     * options only carry data. Mirrors {@see Select::optionSchema()}.
     *
     * @param  array<int, Component>  $components
     */
    public function optionSchema(array $components): static
    {
        $this->optionSchema = $components === [] ? null : array_values($components);

        return $this;
    }

    /**
     * A choice is always backed by a fixed set of options, so its submitted
     * value is constrained to them automatically. `nullable` lets an optional
     * choice stay unselected; `required()` still gates presence when set.
     *
     * @return array<int, mixed>
     */
    #[\Override]
    protected function defaultRules(): array
    {
        if ($this->options === []) {
            return [];
        }

        return ['nullable', Rule::in($this->optionValues())];
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        $props = parent::decorateProps($props);

        if ($this->optionSchema !== null) {
            $schema = $this->renderableComponents($this->optionSchema);
            $props['optionSchema'] = $schema === [] ? null : $schema;
        }

        return $props;
    }
}
