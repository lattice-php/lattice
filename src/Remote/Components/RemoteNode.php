<?php
declare(strict_types=1);

namespace Lattice\Lattice\Remote\Components;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;

final class RemoteNode extends Component
{
    use IsInteractive;

    /**
     * @param  array<string, mixed>  $props
     * @param  list<Component>  $schema
     */
    public function __construct(
        ?string $key = null,
        private string $nodeType = 'remote.node',
        private array $props = [],
        private array $schema = [],
    ) {
        parent::__construct($key);
    }

    #[\Override]
    protected function type(): string
    {
        return $this->nodeType;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 200)]
    #[\Override]
    protected function serialiseProps(array $data): array
    {
        return [
            ...$data,
            'props' => $this->decorateProps($this->props),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseSchema(array $data): array
    {
        if ($this->schema === []) {
            return $data;
        }

        return [
            ...$data,
            'schema' => $this->schema,
        ];
    }
}
