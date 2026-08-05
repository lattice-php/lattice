<?php
declare(strict_types=1);

namespace Lattice\Remote\Components;

use Lattice\Core\Attributes\AsRemoteComponent;
use Lattice\Core\Contracts\ContainerComponent;
use Lattice\Ui\Components\Concerns\HasChildSchema;

#[AsRemoteComponent('data-list')]
final class DataList extends RemoteComponent implements ContainerComponent
{
    use HasChildSchema;

    public ?string $dataEndpoint = null;

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

    public function emptyLabel(string $label): static
    {
        $this->emptyLabel = $label;

        return $this;
    }
}
