<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Ui\Components\Concerns\SealsReferences;

trait IsInteractive
{
    use SealsReferences;

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
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        $props = parent::decorateProps($props);

        if ($this->hasEndpoint($props)) {
            $id = $this->requireId('Interactive', 'an endpoint');

            $props['ref'] = $this->sealRef($this->signatureKey ?? $id, $this->context);
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
