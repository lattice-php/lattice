<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Components\Concerns\HasPrimaryBinding;
use Lattice\Lattice\Ui\Concerns\HasColor;

#[AsComponent('badge')]
class Badge extends Component
{
    use HasColor;
    use HasPrimaryBinding;

    public string $label = '';

    public static function make(string $label, ?string $key = null): static
    {
        $badge = new static($key);
        $badge->label = $label;

        return $badge;
    }

    protected static function primaryBindableProp(): string
    {
        return 'label';
    }
}
