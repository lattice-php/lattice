<?php

namespace Lattice\Lattice\Actions\Components;

use BackedEnum;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionRegistry;
use Lattice\Lattice\Actions\Contracts\Effect;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Concerns\HasHttpMethod;
use Lattice\Lattice\Core\Concerns\HasVariant;

#[Attributes\Component('action')]
class Action extends Component
{
    use HasHttpMethod;
    use HasVariant;
    use IsInteractive;

    public ?string $endpoint = null;

    public ?string $label = null;

    public ?string $icon = null;

    /**
     * @var array{title: string, description?: string, confirmLabel?: string, cancelLabel?: string}|null
     */
    public ?array $confirmation = null;

    /**
     * @var array<int, Effect>
     */
    public array $effects = [];

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<ActionDefinition>  $action
     */
    public static function use(string $action): static
    {
        /** @var static $registered */
        $registered = app(ActionRegistry::class)->component($action);

        return clone $registered;
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function icon(BackedEnum|string $icon): static
    {
        $this->icon = $this->enumValue($icon);

        return $this;
    }

    public function confirm(
        string $title,
        ?string $description = null,
        ?string $confirmLabel = null,
        ?string $cancelLabel = null,
    ): static {
        $this->confirmation = array_filter([
            'title' => $title,
            'description' => $description,
            'confirmLabel' => $confirmLabel,
            'cancelLabel' => $cancelLabel,
        ], fn (mixed $value): bool => $value !== null);

        return $this;
    }

    /**
     * @param  array<int, Effect>  $effects
     */
    public function effects(array $effects): static
    {
        $this->effects = $effects;

        return $this;
    }
}
