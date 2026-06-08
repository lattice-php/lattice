<?php

namespace Bambamboole\Lattice\Components\Core;

class Card extends ContainerComponent
{
    public static function make(string $title, string $description, ?string $key = null): static
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
