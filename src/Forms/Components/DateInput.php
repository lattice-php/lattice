<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

class DateInput extends Field
{
    use HasAutoFocus;
    use HasTabIndex;

    public function min(string $min): static
    {
        return $this->prop('min', $min);
    }

    public function max(string $max): static
    {
        return $this->prop('max', $max);
    }

    protected function type(): string
    {
        return 'form.date-input';
    }
}
