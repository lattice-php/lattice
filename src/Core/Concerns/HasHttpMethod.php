<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Concerns;

use BackedEnum;
use Lattice\Lattice\Core\Enums\HttpMethod;

trait HasHttpMethod
{
    public ?HttpMethod $method = null;

    public function method(BackedEnum|string $method): static
    {
        $this->method = $method instanceof HttpMethod
            ? $method
            : HttpMethod::from($method instanceof BackedEnum ? (string) $method->value : $method);

        return $this;
    }
}
