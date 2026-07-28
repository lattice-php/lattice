<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\Contracts\Authorizable;
use Spatie\Attributes\Attributes;

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

    /**
     * The gate both seams call — render (registry) and endpoint (controller).
     * Abilities declared on the definition attribute are checked first and
     * cannot be widened by an override, so a `can` declaration holds wherever
     * the definition is reached from.
     */
    final public function authorized(Request $request): bool
    {
        return $this->passesDeclaredAbilities($request) && $this->authorize($request);
    }

    public function authorize(Request $request): bool
    {
        return true;
    }

    private function passesDeclaredAbilities(Request $request): bool
    {
        $attribute = Attributes::get(static::class, DefinitionAttribute::class);
        $declared = $attribute instanceof DefinitionAttribute ? $attribute->can : [];

        if ($declared === []) {
            return true;
        }

        $gate = Gate::forUser($request->user());

        return array_all($declared, static fn (string $ability): bool => $gate->allows($ability));
    }

    protected function context(string $key, mixed $default = null): mixed
    {
        return data_get($this->context, $key, $default);
    }

    /**
     * Typed reads of the sealed context. The strict variants abort with a 404
     * when the key is absent or holds the wrong type — inside a render-time
     * authorize() use the OrNull variants instead, or a missing key takes the
     * whole page down rather than hiding the component.
     *
     * The type policy differs per accessor: `contextString`/`contextStringOrNull`
     * require a non-empty `string` and never coerce (an `int` is rejected), while
     * `contextInt`/`contextIntOrNull` accept any `is_numeric` value — including
     * numeric strings — and cast it to `int`.
     */
    protected function contextString(string $key): string
    {
        $value = $this->contextStringOrNull($key);

        if ($value === null) {
            abort(404);
        }

        return $value;
    }

    protected function contextStringOrNull(string $key): ?string
    {
        $value = $this->context($key);

        return is_string($value) && $value !== '' ? $value : null;
    }

    protected function contextInt(string $key): int
    {
        $value = $this->contextIntOrNull($key);

        if ($value === null) {
            abort(404);
        }

        return $value;
    }

    protected function contextIntOrNull(string $key): ?int
    {
        $value = $this->context($key);

        return is_numeric($value) ? (int) $value : null;
    }
}
