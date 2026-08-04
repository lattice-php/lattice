<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components\Concerns;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use LogicException;

/**
 * The shared half of every ref-carrying component: a stable id spread into the
 * wire node, and sealing a signed reference against it. IsInteractive and
 * RemoteComponent build their trigger conditions and sealed payloads on top.
 */
trait SealsReferences
{
    protected ?string $id = null;

    public function id(string $id): static
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 150)]
    protected function serialiseComponentId(array $data): array
    {
        return [
            ...$data,
            'id' => $this->id,
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     */
    protected function sealRef(string $key, array $context): string
    {
        return app(SignsComponentReferences::class)->seal($this->type(), $key, $context);
    }

    protected function requireId(string $role, string $capability): string
    {
        if ($this->id === null) {
            throw new LogicException(sprintf(
                '%s component [%s] must be given an id() before it can be serialised with %s.',
                $role,
                $this->type(),
                $capability,
            ));
        }

        return $this->id;
    }
}
