<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use BackedEnum;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Concerns\HasPrimaryBinding;
use Lattice\Lattice\Ui\Concerns\HasColor;
use Lattice\Lattice\Ui\Concerns\HasSize;

#[AsComponent('icon')]
class Icon extends Component
{
    use HasColor;
    use HasPrimaryBinding;
    use HasSize;

    public string $name = '';

    public ?string $class = null;

    public static function make(BackedEnum|string $name, ?string $key = null): static
    {
        $icon = new static($key);
        $icon->name = Wire::scalar($name);

        return $icon;
    }

    public function class(string $class): static
    {
        $this->class = $class;

        return $this;
    }

    protected static function primaryBindableProp(): string
    {
        return 'name';
    }
}
