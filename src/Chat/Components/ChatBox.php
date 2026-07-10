<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Remote\Components\RemoteComponent;

/**
 * A streaming chat box. Same-origin by default; call source()/audience() to
 * fetch from a remote source with a browser token (see RemoteComponent).
 */
#[AsComponent('chat.box')]
class ChatBox extends RemoteComponent
{
    use HasPlaceholder;

    public ?string $streamEndpoint = null;

    public ?string $historyEndpoint = null;

    public ?string $title = null;

    public bool $fill = false;

    public static function make(string $id): static
    {
        return (new static)->id($id);
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
