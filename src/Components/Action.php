<?php

namespace Bambamboole\Lattice\Components;

use BackedEnum;
use Bambamboole\Lattice\Actions\ActionDefinition;
use Bambamboole\Lattice\Actions\ActionRegistry;
use Bambamboole\Lattice\Actions\Effect;

class Action extends InteractiveComponent
{
    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     */
    public static function use(string $action): static
    {
        $registered = app(ActionRegistry::class)->component($action);

        return (new static)
            ->id($registered->id)
            ->props($registered->props);
    }

    public function endpoint(string $endpoint): static
    {
        return $this->prop('endpoint', $endpoint);
    }

    public function label(string $label): static
    {
        return $this->prop('label', $label);
    }

    public function method(string $method): static
    {
        return $this->prop('method', $method);
    }

    public function variant(string $variant): static
    {
        return $this->prop('variant', $variant);
    }

    public function icon(BackedEnum|string $icon): static
    {
        return $this->prop('icon', $icon instanceof BackedEnum ? (string) $icon->value : $icon);
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
        return $this->prop('effects', array_map(
            fn (Effect $effect): array => $effect->toArray(),
            $effects,
        ));
    }

    protected function type(): string
    {
        return 'action';
    }
}
