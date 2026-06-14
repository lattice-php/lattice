<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * The wire shape of a dedicated table filter. Built by a {@see Filter} and
 * generated to TypeScript; the client dispatches on `type` to render the
 * matching control from `props`.
 */
#[TypeScript]
final readonly class FilterData implements JsonSerializable
{
    /**
     * @param  array<string, mixed>  $props
     */
    public function __construct(
        public string $key,
        public string $label,
        public FilterControl $type,
        public array $props,
    ) {}

    /**
     * @return array{key: string, label: string, type: string, props: array<string, mixed>}
     */
    public function jsonSerialize(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'type' => $this->type->value,
            'props' => $this->props,
        ];
    }
}
