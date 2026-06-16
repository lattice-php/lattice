<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\HasVariant;
use Lattice\Lattice\Core\Enums\ButtonType;

#[AsComponent('button')]
class Button extends Component
{
    use HasVariant;

    public string $label = '';

    public ?string $href = null;

    public ButtonType $buttonType = ButtonType::Button;

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
