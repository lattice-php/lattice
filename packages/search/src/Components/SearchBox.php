<?php
declare(strict_types=1);

namespace Lattice\Search\Components;

use InvalidArgumentException;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\ContainerComponent;

#[AsComponent('search.box')]
class SearchBox extends ContainerComponent
{
    public string $endpoint;

    public ?string $placeholder = null;

    public ?string $title = null;

    public bool $shortcut = true;

    public int $perPage = 20;

    public static function make(string $id): static
    {
        $component = new static($id);
        $component->endpoint = '/'.ltrim((string) config('lattice.search.endpoint', 'lattice/search'), '/');

        return $component;
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
        if ($perPage < 1 || $perPage > 100) {
            throw new InvalidArgumentException('Search results per page must be between 1 and 100.');
        }

        $this->perPage = $perPage;

        return $this;
    }
}
