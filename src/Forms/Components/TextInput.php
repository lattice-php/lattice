<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Concerns\HasAutoComplete;
use Bambamboole\Lattice\Core\Concerns\HasAutoFocus;
use Bambamboole\Lattice\Core\Concerns\HasPlaceholder;
use Bambamboole\Lattice\Core\Concerns\HasTabIndex;

class TextInput extends Field
{
    use HasAutoComplete;
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public function email(): static
    {
        return $this
            ->prop('type', 'email')
            ->rules(['email:rfc,filter']);
    }

    protected function type(): string
    {
        return 'form.text-input';
    }
}
