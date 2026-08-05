<?php
declare(strict_types=1);

namespace Lattice\Fragments\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Fragments\FragmentRegistry;
use Lattice\Ui\Components\ContainerComponent;
use Lattice\Ui\Components\IsInteractive;
use Lattice\Ui\Concerns\HasSize;

#[AsComponent('fragment')]
class Fragment extends ContainerComponent implements InteractiveComponent
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
