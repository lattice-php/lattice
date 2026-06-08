<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Attributes\SerializationHook;
use Bambamboole\Lattice\Components\Core\Component;
use Bambamboole\Lattice\Forms\Conditions\Condition;
use Bambamboole\Lattice\Forms\Conditions\Op;
use Bambamboole\Lattice\Forms\FormData;
use Closure;
use Illuminate\Http\Request;

abstract class Field extends Component
{
    /**
     * @var array<int, mixed>|Closure
     */
    protected array|Closure $rules = [];

    /**
     * @var array<int, Condition>
     */
    protected array $visibleConditions = [];

    /**
     * @var array<int, Condition>
     */
    protected array $requiredConditions = [];

    /**
     * @var array<int, Condition>
     */
    protected array $readonlyConditions = [];

    /**
     * @var array<int, Condition>
     */
    protected array $disabledConditions = [];

    /**
     * @var array<int, array{attributes: array<int, string>, callback: Closure}>
     */
    protected array $dependencies = [];

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

    /**
     * @param  string|array<int, string>  $attributes
     */
    public function dependsOn(string|array $attributes, mixed $operatorOrValue = null, mixed $value = null): static
    {
        if ($operatorOrValue instanceof Closure) {
            $this->dependencies[] = ['attributes' => (array) $attributes, 'callback' => $operatorOrValue];

            return $this;
        }

        $this->visibleConditions[] = $this->makeCondition((string) $attributes, $operatorOrValue, $value, func_num_args());

        return $this;
    }

    public function requiredWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        $this->requiredConditions[] = $this->makeCondition($field, $operatorOrValue, $value, func_num_args());

        return $this;
    }

    public function readonlyWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        $this->readonlyConditions[] = $this->makeCondition($field, $operatorOrValue, $value, func_num_args());

        return $this;
    }

    public function disabledWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        $this->disabledConditions[] = $this->makeCondition($field, $operatorOrValue, $value, func_num_args());

        return $this;
    }

    public function hidden(bool $hidden = true): static
    {
        return $this->prop('hidden', $hidden);
    }

    public function show(): static
    {
        return $this->hidden(false);
    }

    public function hide(): static
    {
        return $this->hidden(true);
    }

    public function required(bool $required = true): static
    {
        return $this->prop('required', $required);
    }

    public function readonly(bool $readonly = true): static
    {
        return $this->prop('readonly', $readonly);
    }

    public function disabled(bool $disabled = true): static
    {
        return $this->prop('disabled', $disabled);
    }

    public function isVisible(FormData $data): bool
    {
        if ($this->props['hidden'] ?? false) {
            return false;
        }

        foreach ($this->visibleConditions as $condition) {
            if (! $condition->matches($data)) {
                return false;
            }
        }

        return true;
    }

    public function isRequired(FormData $data): bool
    {
        return ($this->props['required'] ?? false) || $this->anyMatch($this->requiredConditions, $data);
    }

    /**
     * @param  array<int, Condition>  $conditions
     */
    private function anyMatch(array $conditions, FormData $data): bool
    {
        foreach ($conditions as $condition) {
            if ($condition->matches($data)) {
                return true;
            }
        }

        return false;
    }

    private function makeCondition(string $field, mixed $operatorOrValue, mixed $value, int $argCount): Condition
    {
        if ($argCount >= 3) {
            $operator = $operatorOrValue instanceof Op ? $operatorOrValue : Op::from((string) $operatorOrValue);

            return new Condition($field, $operator, $value);
        }

        return new Condition($field, is_array($operatorOrValue) ? Op::In : Op::Equals, $operatorOrValue);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function serialiseConditions(array $data): array
    {
        $serialise = static fn (array $group): array => array_map(
            static fn (Condition $condition): array => $condition->jsonSerialize(),
            $group,
        );

        $conditions = array_filter([
            'visible' => $serialise($this->visibleConditions),
            'required' => $serialise($this->requiredConditions),
            'readonly' => $serialise($this->readonlyConditions),
            'disabled' => $serialise($this->disabledConditions),
        ], static fn (array $group): bool => $group !== []);

        if ($conditions !== []) {
            $data['props'] = [...$data['props'], 'conditions' => $conditions];
        }

        return $data;
    }
}
