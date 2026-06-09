<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Concerns\HasAutoFocus;
use Bambamboole\Lattice\Core\Concerns\HasPlaceholder;
use Bambamboole\Lattice\Core\Concerns\HasTabIndex;

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
