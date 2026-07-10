<?php
declare(strict_types=1);

namespace Lattice\Lattice\Fragments\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\ContainerComponent;
use Lattice\Lattice\Core\Components\IsInteractive;
use Lattice\Lattice\Core\Concerns\HasSize;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Fragments\FragmentRegistry;

#[AsComponent('fragment')]
class Fragment extends ContainerComponent
{
    use HasSize;
    use IsInteractive;

    public ?string $endpoint = null;

    public bool $lazy = false;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<FragmentDefinition>  $fragment
     * @param  array<string, mixed>  $context
     */
    public static function lazy(string $fragment, array $context = []): self
    {
        return app(FragmentRegistry::class)->lazyComponent($fragment, $context);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }
}
