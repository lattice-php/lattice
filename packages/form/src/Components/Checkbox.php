<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::Checkbox)]
class Checkbox extends Field
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
