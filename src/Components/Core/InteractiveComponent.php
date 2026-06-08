<?php

namespace Bambamboole\Lattice\Components\Core;

abstract class InteractiveComponent extends Component
{
    protected string $id;

    public function id(string $id): static
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    #[\Override]
    public function toArray(): array
    {
        return [
            ...parent::toArray(),
            'id' => $this->id,
        ];
    }
}
