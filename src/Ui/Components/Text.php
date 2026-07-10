<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Concerns\HasColor;
use Lattice\Lattice\Ui\Concerns\HasCopyable;
use Lattice\Lattice\Ui\Concerns\HasSize;
use Lattice\Lattice\Ui\Enums\Align;

#[AsComponent('text')]
class Text extends Component
{
    use HasColor;
    use HasCopyable;
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
}
