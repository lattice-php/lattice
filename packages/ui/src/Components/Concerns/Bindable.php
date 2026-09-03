<?php
declare(strict_types=1);

namespace Lattice\Ui\Components\Concerns;

/**
 * Marks where a data field lands in a rendered tree. Editors that own the
 * data (the block editor) swap a bound node for an inline control; every other
 * renderer ignores the marker.
 */
trait Bindable
{
    protected ?string $binding = null;

    public function bind(string $field): static
    {
        $this->binding = $field;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateBinding(array $props): array
    {
        if ($this->binding === null) {
            return $props;
        }

        return [...$props, 'binding' => $this->binding];
    }
}
