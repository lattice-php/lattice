<?php

namespace Lattice\Lattice\Core\Components;

use BackedEnum;
use Lattice\Lattice\Core\Concerns\HasTabIndex;
use Lattice\Lattice\Core\Enums\HttpMethod;

class Link extends Component
{
    use HasTabIndex;

    public string $label = '';

    public ?string $href = null;

    public ?HttpMethod $method = null;

    public static function make(string $label, ?string $key = null): static
    {
        $link = new static($key);
        $link->label = $label;

        return $link;
    }

    public function href(string $href): static
    {
        $this->href = $href;

        return $this;
    }

    public function method(BackedEnum|string $method): static
    {
        $this->method = $method instanceof HttpMethod
            ? $method
            : HttpMethod::from($method instanceof BackedEnum ? (string) $method->value : $method);

        return $this;
    }

    protected function type(): string
    {
        return 'link';
    }
}
