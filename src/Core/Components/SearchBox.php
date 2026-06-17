<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;

#[AsComponent('search.box')]
class SearchBox extends ContainerComponent
{
    public ?string $endpoint = null;

    public ?string $placeholder = null;

    public ?string $title = null;

    public bool $shortcut = true;

    public int $perPage = 20;

    public static function make(string $key): static
    {
        return new static($key);
    }

    public function endpoint(string $endpoint): static
    {
        $this->endpoint = $endpoint;

        return $this;
    }

    public function placeholder(string $placeholder): static
    {
        $this->placeholder = $placeholder;

        return $this;
    }

    public function title(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function shortcut(bool $shortcut = true): static
    {
        $this->shortcut = $shortcut;

        return $this;
    }

    public function perPage(int $perPage): static
    {
        $this->perPage = $perPage;

        return $this;
    }
}
