<?php

namespace Bambamboole\Lattice\Components\Form\Concerns;

trait HasOptions
{
    /**
     * @return array{label: string, value: string}
     */
    public static function option(string $label, string $value): array
    {
        return [
            'label' => $label,
            'value' => $value,
        ];
    }

    /**
     * @param  array<int, array{label: string, value: string}>  $options
     */
    public function options(array $options): static
    {
        return $this->prop('options', $options);
    }
}
