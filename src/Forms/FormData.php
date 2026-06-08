<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Illuminate\Http\Request;
use Illuminate\Support\Arr;

final class FormData
{
    /**
     * @param  array<array-key, mixed>  $attributes
     */
    public function __construct(private readonly array $attributes) {}

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
        return Arr::get($this->attributes, $key, $default);
    }

    public function has(string $key): bool
    {
        return Arr::has($this->attributes, $key);
    }

    public function string(string $key, string $default = ''): string
    {
        return (string) $this->get($key, $default);
    }

    public function boolean(string $key, bool $default = false): bool
    {
        return filter_var($this->get($key, $default), FILTER_VALIDATE_BOOLEAN);
    }

    public function integer(string $key, int $default = 0): int
    {
        return (int) $this->get($key, $default);
    }

    public function float(string $key, float $default = 0.0): float
    {
        return (float) $this->get($key, $default);
    }

    /**
     * @return array<array-key, mixed>
     */
    public function all(): array
    {
        return $this->attributes;
    }
}
