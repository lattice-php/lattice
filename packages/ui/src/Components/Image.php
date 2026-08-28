<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Concerns\HasPrimaryBinding;

#[AsComponent('image')]
class Image extends Component
{
    use HasPrimaryBinding;

    public string $src = '';

    public ?string $alt = null;

    public ?int $size = null;

    public bool $circular = false;

    public bool $previewable = true;

    public ?string $previewSrc = null;

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

    /**
     * A larger source the lightbox opens instead of `src`, so a thumbnail
     * conversion can render inline while the original stays one click away.
     */
    public function previewSrc(?string $previewSrc): static
    {
        $this->previewSrc = $previewSrc;

        return $this;
    }

    protected static function primaryBindableProp(): string
    {
        return 'src';
    }
}
