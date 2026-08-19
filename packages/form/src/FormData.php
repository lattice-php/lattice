<?php
declare(strict_types=1);

namespace Lattice\Form;

use Illuminate\Http\Request;
use Illuminate\Support\ValidatedInput;

/**
 * A form payload container. It doubles as the raw request state during schema
 * resolution (`fromRequest()`) and as the validated, cast input handed to
 * `handle()` (`make()`). Extends `ValidatedInput`, so the full Laravel
 * `InteractsWithData` API is available: `only`/`except`/`collect`/`date`/
 * `enum`/`boolean`/ArrayAccess/property access.
 */
class FormData extends ValidatedInput
{
    /**
     * @param  array<array-key, mixed>  $attributes
     */
    public static function make(array $attributes): self
    {
        return new self($attributes);
    }

    public static function fromRequest(Request $request): self
    {
        return new self($request->all());
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->input($key, $default);
    }
}
