<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Enums\HttpMethod;

trait HasAction
{
    public ?Component $action = null;

    public function link(string $label, string $href, HttpMethod $method = HttpMethod::Get): static
    {
        return $this->action(Link::make($label)->href($href)->method($method));
    }

    public function action(Component $action): static
    {
        $this->action = $action;

        return $this;
    }
}
