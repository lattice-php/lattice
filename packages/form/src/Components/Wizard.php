<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Ui\Components\ContainerComponent;
use Lattice\Lattice\Ui\Enums\Orientation;
use LogicException;

#[AsComponent('wizard')]
class Wizard extends ContainerComponent
{
    public Orientation $orientation = Orientation::Horizontal;

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
