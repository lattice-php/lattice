<?php

namespace Lattice\Lattice\Actions\Components;

use BackedEnum;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Concerns\HasVariant;

class Action extends Component
{
    use HasVariant;
    use IsInteractive;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     */
    public static function use(string $action): static
    {
        return clone app(ActionRegistry::class)->component($action);
    }

    public function endpoint(string $endpoint): static
    {
        return $this->prop('endpoint', $endpoint);
    }

    public function label(string $label): static
    {
        return $this->prop('label', $label);
    }

    public function method(BackedEnum|string $method): static
    {
        return $this->prop('method', $this->enumValue($method));
    }

    public function icon(BackedEnum|string $icon): static
    {
        return $this->prop('icon', $this->enumValue($icon));
    }

    public function confirm(
        string $title,
        ?string $description = null,
        ?string $confirmLabel = null,
        ?string $cancelLabel = null,
    ): static {
        return $this->prop('confirmation', array_filter([
            'title' => $title,
            'description' => $description,
            'confirmLabel' => $confirmLabel,
            'cancelLabel' => $cancelLabel,
        ], fn (mixed $value): bool => $value !== null));
    }

    /**
     * @param  array<int, Effect>  $effects
     */
    public function effects(array $effects): static
    {
        return $this->prop('effects', $effects);
    }

    protected function type(): string
    {
        return 'action';
    }
}
