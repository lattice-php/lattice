<?php
declare(strict_types=1);

namespace Lattice\Lattice\Integrations\Components;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Integrations\RemoteAccess;
use LogicException;

abstract class RemoteComponent extends Component
{
    protected ?string $id = null;

    public ?RemoteAccess $remote = null;

    private ?string $integration = null;

    private ?string $audience = null;

    /**
     * @var list<string>
     */
    private array $scopes = [];

    public function id(string $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function integration(string $integration): static
    {
        $this->integration = $integration;

        return $this;
    }

    public function audience(string $audience): static
    {
        $this->audience = $audience;

        return $this;
    }

    /**
     * @param  list<string>  $scopes
     */
    public function scopes(array $scopes): static
    {
        $this->scopes = $scopes;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 150)]
    protected function serialiseRemoteId(array $data): array
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
        if ($this->integration !== null || $this->audience !== null || $this->scopes !== []) {
            if ($this->integration === null || $this->audience === null) {
                throw new LogicException(sprintf(
                    'Remote component [%s] must define integration() and audience() before it can be serialised with remote access.',
                    $this->type(),
                ));
            }

            if ($this->id === null) {
                throw new LogicException(sprintf(
                    'Remote component [%s] must be given an id() before it can be serialised with remote access.',
                    $this->type(),
                ));
            }

            $props['remote'] = new RemoteAccess(
                integration: $this->integration,
                audience: $this->audience,
                scopes: $this->scopes,
                nodeId: $this->id,
                nodeType: $this->type(),
                ref: app(SignsComponentReferences::class)->seal($this->type(), $this->id, [
                    'audience' => $this->audience,
                    'integration' => $this->integration,
                    'scopes' => $this->scopes,
                ]),
            );
        }

        return parent::decorateProps($props);
    }
}
