<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

class Textarea extends Field
{
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public function rows(int $rows): static
    {
        return $this->prop('rows', $rows);
    }

    protected function type(): string
    {
        return 'form.textarea';
    }
}
