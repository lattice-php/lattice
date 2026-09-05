<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::Toggle)]
class Toggle extends Field
{
    use HasAutoFocus;
    use HasTabIndex;

    /**
     * @return array<int, mixed>
     */
    #[\Override]
    protected function defaultRules(): array
    {
        return ['boolean'];
    }

    /**
     * A native DOM form submit posts `on` for a checked box, which the
     * `boolean` rule in {@see defaultRules()} would reject. Normalize the
     * recognized boolean spellings before validation and pass anything else
     * through unchanged, so a bogus value still fails the rule.
     */
    #[\Override]
    public function normalizeInput(mixed $value): mixed
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $value;
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    #[\Override]
    public function fillsAbsentInput(): bool
    {
        return true;
    }

    #[\Override]
    public function absentInput(): mixed
    {
        return false;
    }
}
