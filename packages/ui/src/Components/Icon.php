<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use BackedEnum;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Support\Wire;
use Lattice\Ui\Components\Concerns\HasPrimaryBinding;
use Lattice\Ui\Concerns\HasColor;
use Lattice\Ui\Concerns\HasSize;

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
