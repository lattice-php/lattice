<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * The wire shape of a dedicated table filter. Built by a {@see Filter} and
 * generated to TypeScript; the client renders `schema` when present and uses
 * the empty-schema toggle convention otherwise.
 */
#[TypeScript]
final readonly class FilterData implements JsonSerializable
{
    /**
     * @param  array<string, mixed>  $props
     * @param  list<Component>  $schema
     */
    public function __construct(
        public string $key,
        public string $label,
        public FilterControl|string $type,
        public array $schema,
        public array $props,
    ) {}

    /**
     * @return array{key: string, label: string, type: string, schema: list<array<string, mixed>>, props: array<string, mixed>}
     */
    public function jsonSerialize(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'type' => $this->type instanceof FilterControl ? $this->type->value : $this->type,
            'schema' => array_map(static fn (Component $component): array => $component->jsonSerialize(), $this->schema),
            'props' => Wire::map($this->props),
        ];
    }
}
