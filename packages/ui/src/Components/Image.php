<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Components\Concerns\HasPrimaryBinding;

#[AsComponent('image')]
class Image extends Component
{
    use HasPrimaryBinding;

    public string $src = '';

    public ?string $alt = null;

    public ?int $size = null;

    public bool $circular = false;

    public bool $previewable = true;

    public static function make(string $src, ?string $key = null): static
    {
        $image = new static($key);
        $image->src = $src;

        return $image;
    }

    public function src(string $src): static
    {
        $this->src = $src;

        return $this;
    }

    public function alt(?string $alt): static
    {
        $this->alt = $alt;

        return $this;
    }

    public function size(?int $size): static
    {
        $this->size = $size;

        return $this;
    }

    public function circular(bool $circular = true): static
    {
        $this->circular = $circular;

        return $this;
    }

    public function previewable(bool $previewable = true): static
    {
        $this->previewable = $previewable;

        return $this;
    }

    protected static function primaryBindableProp(): string
    {
        return 'src';
    }
}
