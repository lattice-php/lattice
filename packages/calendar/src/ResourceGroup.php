<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Closure;
use JsonSerializable;

final class ResourceGroup implements JsonSerializable
{
    /**
     * @var Closure(): list<array{id: string|int, label: string}>|list<array{id: string|int, label: string}>
     */
    private Closure|array $resources = [];

    private function __construct(
        public readonly string $key,
        public readonly string $label,
    ) {}

    public static function make(string $key, string $label): self
    {
        return new self($key, $label);
    }

    /**
     * @param  Closure(): list<array{id: string|int, label: string}>|list<array{id: string|int, label: string}>  $resources
     */
    public function resources(Closure|array $resources): self
    {
        $this->resources = $resources;

        return $this;
    }

    /**
     * @return array{key: string, label: string, resources: list<array{id: string, label: string}>}
     */
    public function jsonSerialize(): array
    {
        $resources = $this->resources instanceof Closure ? ($this->resources)() : $this->resources;

        return [
            'key' => $this->key,
            'label' => $this->label,
            'resources' => array_map(
                static fn (array $resource): array => [
                    'id' => (string) $resource['id'],
                    'label' => (string) $resource['label'],
                ],
                $resources,
            ),
        ];
    }
}
