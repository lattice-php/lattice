<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Components\Core\Component;
use Bambamboole\Lattice\Forms\FormData;
use Closure;
use Illuminate\Http\Request;

abstract class Field extends Component
{
    /**
     * @var array<int, mixed>|Closure
     */
    protected array|Closure $rules = [];

    public static function make(string $name, string $label): static
    {
        return (new static)->props([
            'label' => $label,
            'name' => $name,
        ]);
    }

    public function name(): string
    {
        return (string) ($this->props['name'] ?? '');
    }

    /**
     * @param  array<int, mixed>|Closure(FormData, Request): array<int, mixed>  $rules
     */
    public function rules(array|Closure $rules): static
    {
        $this->rules = $rules;

        return $this;
    }

    /**
     * @return array<int, mixed>
     */
    public function resolveRules(FormData $data, Request $request): array
    {
        $rules = $this->rules instanceof Closure
            ? ($this->rules)($data, $request)
            : $this->rules;

        return array_values($rules);
    }
}
