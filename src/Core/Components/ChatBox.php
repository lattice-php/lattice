<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;

#[Attributes\Component('chat.box')]
class ChatBox extends Component
{
    public ?string $streamEndpoint = null;

    public ?string $historyEndpoint = null;

    public ?string $conversationId = null;

    public ?string $placeholder = null;

    public ?string $title = null;

    public bool $fill = false;

    public static function make(string $key): static
    {
        return new static($key);
    }

    public function streamEndpoint(string $streamEndpoint): static
    {
        $this->streamEndpoint = $streamEndpoint;

        return $this;
    }

    public function historyEndpoint(string $historyEndpoint): static
    {
        $this->historyEndpoint = $historyEndpoint;

        return $this;
    }

    public function conversationId(string $conversationId): static
    {
        $this->conversationId = $conversationId;

        return $this;
    }

    public function placeholder(string $placeholder): static
    {
        $this->placeholder = $placeholder;

        return $this;
    }

    public function title(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function fill(bool $fill = true): static
    {
        $this->fill = $fill;

        return $this;
    }
}
