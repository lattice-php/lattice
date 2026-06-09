<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Components\Form\Concerns\HasOptions;

class Choice extends Field
{
    use HasOptions;

    public function event(string $event): static
    {
        return $this->prop('event', $event);
    }

    protected function type(): string
    {
        return 'form.choice';
    }
}
