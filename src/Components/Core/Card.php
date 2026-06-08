<?php

namespace Bambamboole\Lattice\Components\Core;

class Card extends Component
{
    public static function make(string $title, string $body, ?string $key = null): static
    {
        return (new static($key))->props([
            'title' => $title,
            'body' => $body,
        ]);
    }

    protected function type(): string
    {
        return 'card';
    }
}
