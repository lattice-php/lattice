<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Ui\Components\ContainerComponent;
use Lattice\Ui\Enums\Align;
use Lattice\Ui\Enums\Orientation;
use LogicException;

#[AsComponent('wizard')]
class Wizard extends ContainerComponent
{
    public Orientation $orientation = Orientation::Horizontal;

    public Align $align = Align::Start;

    /**
     * @param  array<int, WizardStep>  $steps
     */
    public static function make(array $steps = [], ?string $key = null): static
    {
        return new static($key)->schema($steps);
    }

    public function orientation(Orientation $orientation): static
    {
        $this->orientation = $orientation;

        return $this;
    }

    public function vertical(): static
    {
        return $this->orientation(Orientation::Vertical);
    }

    /**
     * Where the step rail sits above the panel. Only a horizontal wizard has a
     * choice — a vertical one keeps its rail in a fixed column beside the panel.
     */
    public function align(Align $align): static
    {
        $this->align = $align;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 290)]
    protected function assertStepChildren(array $data): array
    {
        foreach ($this->renderableChildren() as $child) {
            if (! $child instanceof WizardStep) {
                throw new LogicException('Wizard children must be WizardStep components.');
            }
        }

        return $data;
    }
}
