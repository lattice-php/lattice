<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components\Concerns;

trait HasDataBindings
{
    /**
     * @var array<string, string>
     */
    protected array $dataBindings = [];

    public function dataKey(string $property, string $key): static
    {
        $this->dataBindings[$property] = $key;

        return $this;
    }

    /**
     * @param  array<string, string>  $bindings
     */
    public function dataBindings(array $bindings): static
    {
        $this->dataBindings = $bindings;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateDataBindings(array $props): array
    {
        if ($this->dataBindings === []) {
            return $props;
        }

        return [
            ...$props,
            'dataBindings' => $this->dataBindings,
        ];
    }
}
