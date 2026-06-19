<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Contracts\Authorizable;

abstract class Definition implements Authorizable
{
    /**
     * The instance context, set identically on render (by the registry) and on
     * the endpoint (by the controller, from the sealed reference).
     *
     * @var array<string, mixed>
     */
    protected array $context = [];

    /**
     * @param  array<string, mixed>  $context
     */
    public function withContext(array $context): static
    {
        $this->context = $context;

        return $this;
    }

    public function authorize(Request $request): bool
    {
        return true;
    }

    protected function context(string $key, mixed $default = null): mixed
    {
        return data_get($this->context, $key, $default);
    }
}
