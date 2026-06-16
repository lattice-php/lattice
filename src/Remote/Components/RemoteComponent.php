<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote\Components;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Remote\RemoteAccess;
use Lattice\Lattice\Remote\RemoteSourceRegistry;
use LogicException;

abstract class RemoteComponent extends Component
{
    protected ?string $id = null;

    public ?RemoteAccess $remote = null;

    private ?string $source = null;

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

    public function source(string $source): static
    {
        $this->source = $source;

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
        if ($this->source !== null || $this->audience !== null || $this->scopes !== []) {
            if ($this->source === null || $this->audience === null) {
                throw new LogicException(sprintf(
                    'Remote component [%s] must define source() and audience() before it can be serialised with remote access.',
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
                source: $this->source,
                audience: $this->audience,
                scopes: $this->scopes,
                nodeId: $this->id,
                nodeType: $this->type(),
                tokenEndpoint: app(RemoteSourceRegistry::class)->endpointFor($this->source),
                ref: app(SignsComponentReferences::class)->seal($this->type(), $this->id, [
                    'audience' => $this->audience,
                    'source' => $this->source,
                    'scopes' => $this->scopes,
                ]),
            );
        }

        return parent::decorateProps($props);
    }
}
