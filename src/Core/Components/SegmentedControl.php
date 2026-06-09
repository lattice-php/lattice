<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Components;

use Bambamboole\Lattice\Components\Concerns\HasOptions;

/**
 * A standalone segmented control (single-select pills) that lives outside a form
 * and emits a client event when the selection changes. Use it for client-side
 * settings (e.g. an appearance switcher) rather than as a form field.
 */
class SegmentedControl extends Component
{
    use HasOptions;

    public static function make(string $name, ?string $label = null, ?string $key = null): static
    {
        return (new static($key))->props([
            'name' => $name,
            'label' => $label,
        ]);
    }

    public function value(string $value): static
    {
        return $this->prop('value', $value);
    }

    /**
     * The window event dispatched when the selection changes (detail: { name, value }).
     */
    public function emits(string $event): static
    {
        return $this->prop('emits', $event);
    }

    protected function type(): string
    {
        return 'segmented-control';
    }
}
