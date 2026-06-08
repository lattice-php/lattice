<?php

namespace Bambamboole\Lattice\Components\Core;

use Bambamboole\Lattice\Security\ComponentReferenceSigner;

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
        $props = $this->props;
        $context = is_array($props['context'] ?? null) ? $props['context'] : [];

        unset($props['context']);

        if ($this->hasEndpoint($props)) {
            $props['ref'] = app(ComponentReferenceSigner::class)->seal($this->type(), $this->id, $context);
        }

        $data = [
            ...parent::toArray(),
            'id' => $this->id,
        ];

        if ($props === []) {
            unset($data['props']);

            return $data;
        }

        return [
            ...$data,
            'props' => $props,
        ];
    }

    /**
     * @param  array<string, mixed>  $props
     */
    private function hasEndpoint(array $props): bool
    {
        return is_string($props['endpoint'] ?? null) || is_string($props['action'] ?? null);
    }
}
