<?php

namespace Lattice\Lattice\Fragments\Components;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Fragments\FragmentRegistry;

#[Attributes\Component('fragment')]
class Fragment extends ContainerComponent
{
    use IsInteractive;

    public ?string $endpoint = null;

    public ?bool $lazy = null;

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
}
