<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use LogicException;

trait IsInteractive
{
    protected ?string $id = null;

    /**
     * The key the reference is sealed under (the registered definition slug).
     * Defaults to the id, so the DOM id can vary freely per instance while the
     * sealed key still matches the endpoint slug.
     */
    protected ?string $signatureKey = null;

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
     * Set the key the reference is sealed under (the registered definition slug).
     */
    public function signedAs(string $signatureKey): static
    {
        $this->signatureKey = $signatureKey;

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
        $props = parent::decorateProps($props);

        if ($this->hasEndpoint($props)) {
            if ($this->id === null) {
                throw new LogicException(sprintf(
                    'Interactive component [%s] must be given an id() before it can be serialised with an endpoint.',
                    $this->type(),
                ));
            }

            $props['ref'] = app(SignsComponentReferences::class)->seal($this->type(), $this->signatureKey ?? $this->id, $this->context);
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
