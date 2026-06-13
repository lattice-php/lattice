<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

#[Component('form.date-input')]
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
}
