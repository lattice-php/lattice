<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

#[Component('form.textarea')]
class Textarea extends Field
{
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public ?int $rows = null;

    public function rows(int $rows): static
    {
        $this->rows = $rows;

        return $this;
    }
}
