<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Concerns\HasIcon;
use Lattice\Lattice\Ui\Concerns\HasVariant;
use Lattice\Lattice\Ui\Concerns\Triggerable;
use Lattice\Lattice\Ui\Enums\ButtonType;

#[AsComponent('button')]
class Button extends Component
{
    use HasIcon;
    use HasVariant;
    use Triggerable;

    public ButtonType $buttonType = ButtonType::Button;

    public static function make(string $label, ?string $key = null): static
    {
        $button = new static($key);
        $button->label = $label;

        return $button;
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
