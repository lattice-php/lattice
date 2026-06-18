<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use BackedEnum;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasVariant;
use Lattice\Lattice\Core\Enums\ButtonType;
use Lattice\Lattice\Effects\Contracts\Effect;

#[AsComponent('button')]
class Button extends Component
{
    use HasVariant;

    public string $label = '';

    public ?string $href = null;

    public ?string $icon = null;

    public ButtonType $buttonType = ButtonType::Button;

    /**
     * Effects dispatched on the client when the button is clicked, with no
     * request to the server. Use the {@see Effect} factories, e.g.
     * `->effects(Effect::toggleSidebar('app-sidebar'))`.
     *
     * @var array<int, Effect>
     */
    public array $effects = [];

    public static function make(string $label, ?string $key = null): static
    {
        $button = new static($key);
        $button->label = $label;

        return $button;
    }

    public function href(string $href): static
    {
        $this->href = $href;

        return $this;
    }

    public function icon(BackedEnum|string $icon): static
    {
        $this->icon = $this->enumValue($icon);

        return $this;
    }

    public function effects(Effect ...$effects): static
    {
        $this->effects = $effects;

        return $this;
    }

    public function buttonType(ButtonType $buttonType): static
    {
        $this->buttonType = $buttonType;

        return $this;
    }

    public function submit(): static
    {
        return $this->buttonType(ButtonType::Submit);
    }
}
