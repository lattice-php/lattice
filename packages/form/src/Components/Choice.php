<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Validation\Rule;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasOptions;
use Lattice\Ui\Concerns\HasTabIndex;

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
