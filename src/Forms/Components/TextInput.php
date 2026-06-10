<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasAutoComplete;
use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

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
