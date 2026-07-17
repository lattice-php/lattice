<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote\Components;

use Lattice\Lattice\Remote\RemoteAccess;
use Lattice\Lattice\Remote\RemoteSourceRegistry;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Concerns\SealsReferences;
use LogicException;

abstract class RemoteComponent extends Component
{
    use SealsReferences;

    public ?RemoteAccess $remote = null;

    private ?string $source = null;

    private ?string $audience = null;

    /**
     * @var list<string>
     */
    private array $scopes = [];

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
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        if ($this->source !== null || $this->audience !== null || $this->scopes !== []) {
            if ($this->source === null || $this->audience === null) {
                throw new LogicException(sprintf(
                    'Remote component [%s] must define source() and audience() before it can be serialised with remote access.',
                    $this->type(),
                ));
            }

            $id = $this->requireId('Remote', 'remote access');

            $props['remote'] = new RemoteAccess(
                source: $this->source,
                audience: $this->audience,
                scopes: $this->scopes,
                nodeId: $id,
                nodeType: $this->type(),
                tokenEndpoint: app(RemoteSourceRegistry::class)->endpointFor($this->source),
                ref: $this->sealRef($id, [
                    'audience' => $this->audience,
                    'source' => $this->source,
                    'scopes' => $this->scopes,
                ]),
            );
        }

        return parent::decorateProps($props);
    }
}
