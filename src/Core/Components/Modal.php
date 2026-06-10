<?php

namespace Lattice\Lattice\Core\Components;

class Modal extends ContainerComponent
{
    use IsInteractive;

    public ?string $title = null;

    public ?string $description = null;

    public ?string $closeLabel = null;

    public ?bool $open = null;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    public function title(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function description(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function closeLabel(string $label): static
    {
        $this->closeLabel = $label;

        return $this;
    }

    public function open(bool $open = true): static
    {
        $this->open = $open;

        return $this;
    }

    protected function type(): string
    {
        return 'modal';
    }
}
