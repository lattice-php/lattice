<?php

namespace Lattice\Lattice\Core\Components;

class Card extends ContainerComponent
{
    public ?string $title = null;

    public ?string $description = null;

    public static function make(?string $title = null, ?string $description = null, ?string $key = null): static
    {
        $card = new static($key);

        if ($title !== null) {
            $card->title = $title;
        }

        if ($description !== null) {
            $card->description = $description;
        }

        return $card;
    }

    protected function type(): string
    {
        return 'card';
    }
}
