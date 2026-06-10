<?php

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Forms\Conditions\Condition;
use Lattice\Lattice\Forms\Conditions\ConditionSet;
use Lattice\Lattice\Forms\Enums\ConditionOperator;
use Lattice\Lattice\Forms\FormData;

abstract class Field extends Component
{
    /**
     * Validation rules. Each entry is a rule (string/object) or a Closure that
     * returns additional rules. Rules accumulate across calls.
     *
     * @var array<int, mixed>
     */
    protected array $rules = [];

    /**
     * Conditional state rules keyed by intent (visible/required/readonly/disabled).
     * Sets are created lazily as conditions are added.
     *
     * @var array<string, ConditionSet>
     */
    protected array $conditions = [];

    /**
     * @var array<int, array{attributes: array<int, string>, callback: Closure}>
     */
    protected array $dependencies = [];

    protected ?Closure $valueResolver = null;

    protected bool $resolving = false;

    protected bool $hasResolvedValue = false;

    /**
     * @var array<string, string>
     */
    protected array $messages = [];

    public static function make(string $name, ?string $label = null): static
    {
        $props = ['name' => $name];

        if ($label !== null) {
            $props['label'] = $label;
        }

        return (new static)->props($props);
    }

    public function name(): string
    {
        return (string) ($this->props['name'] ?? '');
    }

    public function label(string $label): static
    {
        return $this->prop('label', $label);
    }

    /**
     * @internal
     */
    public function getLabel(): ?string
    {
        $label = $this->props['label'] ?? null;

        return is_string($label) ? $label : null;
    }

    public function message(string $rule, string $message): static
    {
        $this->messages[$rule] = $message;

        return $this;
    }

    /**
     * @internal
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->messages;
    }

    /**
     * Add validation rules. An array is merged onto the existing rules; a Closure
     * (receiving FormData and Request) is resolved to additional rules at validation
     * time. Calls accumulate.
     *
     * @param  array<int, mixed>|Closure(FormData, Request): array<int, mixed>  $rules
     */
    public function rules(array|Closure $rules): static
    {
        $this->rules = $rules instanceof Closure
            ? [...$this->rules, $rules]
            : [...$this->rules, ...$rules];

        return $this;
    }

    /**
     * @internal
     *
     * @return array<int, mixed>
     */
    public function resolveRules(FormData $data, Request $request): array
    {
        $resolved = [];

        foreach ($this->rules as $rule) {
            if ($rule instanceof Closure) {
                $resolved = [...$resolved, ...$rule($data, $request)];

                continue;
            }

            $resolved[] = $rule;
        }

        return array_values($resolved);
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

        return $this->addCondition('visible', (string) $attributes, $operatorOrValue, $value, func_num_args());
    }

    public function visibleWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        return $this->addCondition('visible', $field, $operatorOrValue, $value, func_num_args());
    }

    public function requiredWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        return $this->addCondition('required', $field, $operatorOrValue, $value, func_num_args());
    }

    public function readOnlyWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        return $this->addCondition('readonly', $field, $operatorOrValue, $value, func_num_args());
    }

    public function disabledWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        return $this->addCondition('disabled', $field, $operatorOrValue, $value, func_num_args());
    }

    private function addCondition(string $group, string $field, mixed $operatorOrValue, mixed $value, int $argCount): static
    {
        ($this->conditions[$group] ??= new ConditionSet)
            ->add($this->makeCondition($field, $operatorOrValue, $value, $argCount));

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

    public function readOnly(bool $readOnly = true): static
    {
        return $this->prop('readonly', $readOnly);
    }

    public function disabled(bool $disabled = true): static
    {
        return $this->prop('disabled', $disabled);
    }

    public function value(mixed $value): static
    {
        if ($value instanceof Closure) {
            $this->valueResolver = $value;

            return $this;
        }

        $this->prop('value', $value);

        if ($this->resolving) {
            $this->hasResolvedValue = true;
        }

        return $this;
    }

    /**
     * @internal
     */
    public function isComputed(): bool
    {
        return $this->dependencies !== [] || $this->valueResolver !== null;
    }

    /**
     * @internal
     */
    public function applyResolution(FormData $data, Request $request): void
    {
        $this->resolving = true;

        foreach ($this->dependencies as $dependency) {
            ($dependency['callback'])($this, $data, $request);
        }

        if ($this->valueResolver !== null) {
            $this->value(($this->valueResolver)($data, $request));
        }

        $this->resolving = false;
    }

    /**
     * @internal
     */
    public function hasResolvedValue(): bool
    {
        return $this->hasResolvedValue;
    }

    /**
     * @internal
     */
    public function resolvedValue(): mixed
    {
        return $this->props['value'] ?? null;
    }

    /**
     * @internal
     */
    public function isVisible(FormData $data): bool
    {
        if ($this->props['hidden'] ?? false) {
            return false;
        }

        return ($this->conditions['visible'] ?? null)?->allMatch($data) ?? true;
    }

    /**
     * @internal
     */
    public function isRequired(FormData $data): bool
    {
        return ($this->props['required'] ?? false) || (($this->conditions['required'] ?? null)?->anyMatches($data) ?? false);
    }

    /**
     * @internal
     */
    public function isReadOnly(FormData $data): bool
    {
        return ($this->props['readonly'] ?? false) || (($this->conditions['readonly'] ?? null)?->anyMatches($data) ?? false);
    }

    /**
     * @internal
     */
    public function isDisabled(FormData $data): bool
    {
        return ($this->props['disabled'] ?? false) || (($this->conditions['disabled'] ?? null)?->anyMatches($data) ?? false);
    }

    /**
     * @internal
     */
    public function hasValue(): bool
    {
        return array_key_exists('value', $this->props);
    }

    /**
     * Transform the validated value before it reaches handle(). Override per field
     * (e.g. decode a JSON document). Defaults to returning the value unchanged.
     */
    public function castValue(mixed $value): mixed
    {
        return $value;
    }

    /**
     * React to the form's filled value for this field during serialization. Override
     * per field (e.g. a Select resolving labels for stored ids). Defaults to a no-op.
     */
    public function prefill(mixed $value): void {}

    private function makeCondition(string $field, mixed $operatorOrValue, mixed $value, int $argCount): Condition
    {
        if ($argCount >= 3) {
            $operator = $operatorOrValue instanceof ConditionOperator ? $operatorOrValue : ConditionOperator::from((string) $operatorOrValue);

            return new Condition($field, $operator, $value);
        }

        return new Condition($field, is_array($operatorOrValue) ? ConditionOperator::In : ConditionOperator::Equals, $operatorOrValue);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function serialiseConditions(array $data): array
    {
        $conditions = [];

        foreach (['visible', 'required', 'readonly', 'disabled'] as $group) {
            $serialised = ($this->conditions[$group] ?? null)?->jsonSerialize() ?? [];

            if ($serialised !== []) {
                $conditions[$group] = $serialised;
            }
        }

        if ($conditions !== []) {
            $data['props'] = [...$data['props'], 'conditions' => $conditions];
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 260)]
    protected function serialiseDependencies(array $data): array
    {
        $keys = [];

        foreach ($this->dependencies as $dependency) {
            foreach ($dependency['attributes'] as $attribute) {
                $keys[$attribute] = true;
            }
        }

        if ($keys !== []) {
            $data['props'] = [...$data['props'], 'dependsOnKeys' => array_keys($keys)];
        }

        if ($this->valueResolver !== null) {
            $data['props'] = [...$data['props'], 'dependsOnAny' => true];
        }

        return $data;
    }
}
