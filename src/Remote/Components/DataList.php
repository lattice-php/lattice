<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote\Components;

use Lattice\Lattice\Attributes\AsRemoteComponent;

#[AsRemoteComponent('data-list')]
final class DataList extends RemoteComponent
{
    public ?string $dataEndpoint = null;

    public ?string $titleKey = null;

    public ?string $subtitleKey = null;

    public ?string $emptyLabel = null;

    public static function make(string $id): static
    {
        return (new self)->id($id);
    }

    public function dataEndpoint(string $endpoint): static
    {
        $this->dataEndpoint = $endpoint;

        return $this;
    }

    public function titleKey(string $key): static
    {
        $this->titleKey = $key;

        return $this;
    }

    public function subtitleKey(string $key): static
    {
        $this->subtitleKey = $key;

        return $this;
    }

    public function emptyLabel(string $label): static
    {
        $this->emptyLabel = $label;

        return $this;
    }
}
