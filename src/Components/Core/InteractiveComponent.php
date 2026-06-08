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
     * @param  array<string, mixed>  $context
     */
    public function context(array $context): static
    {
        return $this->prop('context', $context);
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
