<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

class DateInput extends Field
{
    use HasAutoFocus;
    use HasTabIndex;

    public ?string $min = null;

    public ?string $max = null;

    public function min(string $min): static
    {
        $this->min = $min;

        return $this;
    }

    public function max(string $max): static
    {
        $this->max = $max;

        return $this;
    }

    protected function type(): string
    {
        return 'form.date-input';
    }
}
