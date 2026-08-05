<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Concerns\HasPrimaryBinding;
use Lattice\Ui\Concerns\HasColor;
use Lattice\Ui\Concerns\HasCopyable;
use Lattice\Ui\Concerns\HasSize;
use Lattice\Ui\Enums\Align;

#[AsComponent('text')]
class Text extends Component
{
    use HasColor;
    use HasCopyable;
    use HasPrimaryBinding;
    use HasSize;

    public string $text = '';

    public ?Align $align = null;

    public static function make(string $text, ?string $key = null): static
    {
        $component = new static($key);
        $component->text = $text;

        return $component;
    }

    public function align(Align $align): static
    {
        $this->align = $align;

        return $this;
    }

    protected static function primaryBindableProp(): string
    {
        return 'text';
    }
}
