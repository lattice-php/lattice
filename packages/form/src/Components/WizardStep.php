<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Support\Str;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\ContainerComponent;

#[AsComponent('wizard-step')]
class WizardStep extends ContainerComponent
{
    public string $name = '';

    public string $label = '';

    public ?string $description = null;

    public static function make(string $name, ?string $label = null, ?string $key = null): static
    {
        $step = new static($key);
        $step->name = $name;
        $step->label = $label ?? Str::headline($name);

        return $step;
    }

    public function description(string $description): static
    {
        $this->description = $description;

        return $this;
    }
}
