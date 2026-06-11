<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use LogicException;

trait IsInteractive
{
    protected ?string $id = null;

    /** @var array<string, mixed> */
    protected array $context = [];

    /**
     * Populated during serialization for interactive components with an endpoint;
     * declared here so the wire prop is generated to TypeScript.
     */
    public ?string $ref = null;

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
        $this->context = $context;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 150)]
    protected function serialiseInteractiveId(array $data): array
    {
        return [
            ...$data,
            'id' => $this->id,
        ];
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        if ($this->hasEndpoint($props)) {
            if ($this->id === null) {
                throw new LogicException(sprintf(
                    'Interactive component [%s] must be given an id() before it can be serialised with an endpoint.',
                    $this->type(),
                ));
            }

            $props['ref'] = app(SignsComponentReferences::class)->seal($this->type(), $this->id, $this->context);
        }

        return $props;
    }

    /**
     * @param  array<string, mixed>  $props
     */
    private function hasEndpoint(array $props): bool
    {
        return is_string($props['endpoint'] ?? null) || is_string($props['action'] ?? null);
    }
}
