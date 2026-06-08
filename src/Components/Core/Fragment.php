<?php

namespace Bambamboole\Lattice\Components\Core;

use Bambamboole\Lattice\Fragments\FragmentDefinition;
use Bambamboole\Lattice\Fragments\FragmentRegistry;

class Fragment extends ContainerComponent
{
    use IsInteractive;

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
        return $this->prop('endpoint', $endpoint);
    }

    protected function type(): string
    {
        return 'fragment';
    }
}
