<?php
declare(strict_types=1);

namespace Lattice\Lattice\Fragments\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Enums\Size;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Fragments\FragmentRegistry;

#[AsComponent('fragment')]
class Fragment extends ContainerComponent
{
    use IsInteractive;

    public ?string $endpoint = null;

    public ?bool $lazy = null;

    public Size $size = Size::Md;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<FragmentDefinition>  $fragment
     */
    public static function lazy(string $fragment): self
    {
        return app(FragmentRegistry::class)->lazyComponent($fragment);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function size(Size $size): static
    {
        $this->size = $size;

        return $this;
    }
}
