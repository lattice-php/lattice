<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Concerns\HasPrimaryBinding;
use Lattice\Ui\Concerns\HasColor;

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
