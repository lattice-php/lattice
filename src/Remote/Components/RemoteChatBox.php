<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote\Components;

use Lattice\Lattice\Attributes\AsRemoteComponent;

#[AsRemoteComponent('chat-box')]
final class RemoteChatBox extends RemoteComponent
{
    public ?string $streamEndpoint = null;

    public ?string $historyEndpoint = null;

    public ?string $conversationId = null;

    public ?string $placeholder = null;

    public ?string $title = null;

    public bool $fill = false;

    public static function make(string $id): static
    {
        return (new self)->id($id);
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
