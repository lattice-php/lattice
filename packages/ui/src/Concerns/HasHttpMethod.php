<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

use Lattice\Lattice\Ui\Enums\HttpMethod;

trait HasHttpMethod
{
    public ?HttpMethod $method = null;

    public function method(HttpMethod $method): static
    {
        $this->method = $method;

        return $this;
    }
}
