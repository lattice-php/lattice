<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Concerns\HasAutoFocus;
use Bambamboole\Lattice\Core\Concerns\HasTabIndex;

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
