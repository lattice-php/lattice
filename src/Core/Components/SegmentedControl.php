<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasOptions;

/**
 * A standalone segmented control (single-select pills) that lives outside a form
 * and emits a client event when the selection changes. Use it for client-side
 * settings (e.g. an appearance switcher) rather than as a form field.
 */
#[AsComponent('segmented-control')]
class SegmentedControl extends Component
{
    use HasOptions;

    public string $name = '';

    public ?string $label = null;

    public ?string $value = null;

    public ?string $emits = null;

    public static function make(string $name, ?string $label = null, ?string $key = null): static
    {
        $control = new static($key);
        $control->name = $name;

        if ($label !== null) {
            $control->label = $label;
        }

        return $control;
    }

    public function value(string $value): static
    {
        $this->value = $value;

        return $this;
    }

    /**
     * The window event dispatched when the selection changes (detail: { name, value }).
     */
    public function emits(string $event): static
    {
        $this->emits = $event;

        return $this;
    }
}
