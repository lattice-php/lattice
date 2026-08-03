<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Validation\Rule;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasOptions;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::Choice)]
class Choice extends Field
{
    use HasAutoFocus;
    use HasOptions;
    use HasTabIndex;

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
}
