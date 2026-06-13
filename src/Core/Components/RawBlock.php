<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;

#[Attributes\Component('raw-block')]
class RawBlock extends Component
{
    public string $html = '';

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function html(string $html): static
    {
        $this->html = $html;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function blade(string $view, array $data = []): static
    {
        $this->html = view($view, $data)->render();

        return $this;
    }
}
