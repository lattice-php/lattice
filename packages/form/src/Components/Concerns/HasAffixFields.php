<?php
declare(strict_types=1);

namespace Lattice\Form\Components\Concerns;

use Lattice\Core\Attributes\SerializationHook;
use Lattice\Form\Components\Field;
use Lattice\Form\Components\Select;
use LogicException;

/**
 * An interactive Select rendered in the field's affix slot (e.g. a currency
 * code beside an amount input, a dialing code beside a phone number). The
 * select stays a full form field — own name, value, rules, conditions — and
 * submits alongside the host field. A field affix replaces a static
 * prefix()/suffix() on the same side.
 */
trait HasAffixFields
{
    public ?string $prefixFieldName = null;

    public ?string $suffixFieldName = null;

    protected ?Select $prefixFieldSelect = null;

    protected ?Select $suffixFieldSelect = null;

    public function prefixField(Select $field): static
    {
        $this->prefixFieldSelect = $field;
        $this->prefixFieldName = $field->name();

        return $this;
    }

    public function suffixField(Select $field): static
    {
        $this->suffixFieldSelect = $field;
        $this->suffixFieldName = $field->name();

        return $this;
    }

    /**
     * @return list<Field>
     */
    public function affixFields(): array
    {
        $fields = array_values(array_filter([$this->prefixFieldSelect, $this->suffixFieldSelect]));

        foreach ($fields as $field) {
            if ($field->multiple || $field->creatable) {
                throw new LogicException(sprintf(
                    'The affix select "%s" must be single-value and non-creatable.',
                    $field->name(),
                ));
            }
        }

        return $fields;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseAffixFields(array $data): array
    {
        $fields = array_values(array_filter(
            $this->affixFields(),
            fn (Field $field): bool => $field->shouldRender(),
        ));

        return $fields === [] ? $data : [...$data, 'schema' => $fields];
    }
}
