<?php

namespace Bambamboole\Lattice\Core\Components;

class Card extends ContainerComponent
{
    public static function make(?string $title = null, ?string $description = null, ?string $key = null): static
    {
        return (new static($key))->props([
            'title' => $title,
            'description' => $description,
        ]);
    }

    protected function type(): string
    {
        return 'card';
    }
}
