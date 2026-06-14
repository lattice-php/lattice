<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Core\Concerns\HasOptions;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A dropdown filter. Single by default ({@see Builder::where}); `multiple()`
 * matches any of the selected values ({@see Builder::whereIn}).
 */
class SelectFilter extends BaseFilter
{
    use HasOptions;
    use HasPlaceholder;

    public bool $multiple = false;

    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    public function toData(): FilterData
    {
        return new FilterData(
            $this->key,
            $this->label,
            FilterControl::Select,
            [
                'options' => $this->options,
                'multiple' => $this->multiple,
                'searchable' => false,
                'placeholder' => $this->placeholder,
            ],
        );
    }

    public function apply(Builder $builder, mixed $value): void
    {
        if ($this->multiple) {
            $values = $this->normalizeValues($value);

            if ($values !== []) {
                $builder->whereIn($this->column(), $values);
            }

            return;
        }

        if (is_string($value) && $value !== '') {
            $builder->where($this->column(), $value);
        }
    }

    /**
     * @return list<string>
     */
    private function normalizeValues(mixed $value): array
    {
        return array_values(array_filter(
            array_map(static fn (mixed $item): string => (string) $item, is_array($value) ? $value : [$value]),
            static fn (string $item): bool => $item !== '',
        ));
    }
}
