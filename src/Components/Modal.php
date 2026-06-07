<?php

namespace Bambamboole\Lattice\Components;

class Modal extends InteractiveComponent
{
    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    public function title(string $title): static
    {
        return $this->prop('title', $title);
    }

    public function description(string $description): static
    {
        return $this->prop('description', $description);
    }

    public function closeLabel(string $label): static
    {
        return $this->prop('closeLabel', $label);
    }

    public function open(bool $open = true): static
    {
        return $this->prop('open', $open);
    }

    protected function type(): string
    {
        return 'modal';
    }
}
