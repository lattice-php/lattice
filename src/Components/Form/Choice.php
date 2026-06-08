<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Components\Core\Component;

class Choice extends Component
{
    public static function make(string $name, string $label): static
    {
        return (new static)->props([
            'label' => $label,
            'name' => $name,
        ]);
    }

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

    public function value(string $value): static
    {
        return $this->prop('value', $value);
    }

    public function event(string $event): static
    {
        return $this->prop('event', $event);
    }

    /**
     * @param  array<int, array{label: string, value: string}>  $options
     */
    public function options(array $options): static
    {
        return $this->prop('options', $options);
    }

    protected function type(): string
    {
        return 'form.choice';
    }
}
