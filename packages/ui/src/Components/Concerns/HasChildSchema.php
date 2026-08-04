<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components\Concerns;

use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Ui\Concerns\ResolvesSchemaEntries;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;

trait HasChildSchema
{
    use FiltersRenderableComponents;
    use ResolvesSchemaEntries;

    /**
     * @var array<int, SchemaEntry>
     */
    protected array $children = [];

    /**
     * @var array<int, Component>|null
     */
    private ?array $resolvedChildren = null;

    /**
     * @param  array<int, SchemaEntry>  $components
     */
    public function schema(array $components): static
    {
        $this->children = $components;
        $this->resolvedChildren = null;

        return $this;
    }

    /**
     * @return array<int, Component>
     */
    protected function resolvedChildren(): array
    {
        return $this->resolvedChildren ??= $this->resolveSchemaEntries($this->children);
    }

    /**
     * @return array<int, Component>
     */
    protected function renderableChildren(): array
    {
        return $this->renderableComponents($this->resolvedChildren());
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseSchema(array $data): array
    {
        return [
            ...$data,
            'schema' => $this->renderableChildren(),
        ];
    }
}
