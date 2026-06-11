<?php

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Forms\Conditions\Condition;
use Lattice\Lattice\Forms\Conditions\ConditionSet;
use Lattice\Lattice\Forms\FormData;

abstract class Field extends Component
{
    public string $name = '';

    public ?string $label = null;

    public mixed $value = null;

    public ?bool $hidden = null;

    public ?bool $required = null;

    public ?bool $readonly = null;

    public ?bool $disabled = null;

    /**
     * @var array<string, array<int, array{field: string, operator: string, value: mixed}>>|null
     */
    public ?array $conditions = null;

    /**
     * @var array<int, string>|null
     */
    public ?array $dependsOnKeys = null;

    public ?bool $dependsOnAny = null;

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
    protected array $conditionSets = [];

    /**
     * @var array<int, array{attributes: array<int, string>, callback: Closure}>
     */
    protected array $dependencies = [];

    protected ?Closure $valueResolver = null;

    protected bool $resolving = false;

    protected bool $hasResolvedValue = false;

    protected bool $valueWasSet = false;

    /**
     * @var array<string, string>
     */
    protected array $messages = [];

    public static function make(string $name, ?string $label = null): static
    {
        $field = new static;
        $field->name = $name;

        if ($label !== null) {
            $field->label = $label;
        }

        return $field;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    /**
     * @internal
     */
    public function getLabel(): ?string
    {
        return $this->label;
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

        return $this->addCondition('visible', (string) $attributes, $operatorOrValue, $value);
    }

    public function visibleWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        return $this->addCondition('visible', $field, $operatorOrValue, $value);
    }

    public function requiredWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        return $this->addCondition('required', $field, $operatorOrValue, $value);
    }

    public function readOnlyWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        return $this->addCondition('readonly', $field, $operatorOrValue, $value);
    }

    public function disabledWhen(string $field, mixed $operatorOrValue = null, mixed $value = null): static
    {
        return $this->addCondition('disabled', $field, $operatorOrValue, $value);
    }

    private function addCondition(string $group, string $field, mixed $operatorOrValue, mixed $value): static
    {
        ($this->conditionSets[$group] ??= new ConditionSet)
            ->add($this->makeCondition($field, $operatorOrValue, $value));

        return $this;
    }

    public function hidden(bool $hidden = true): static
    {
        $this->hidden = $hidden;

        return $this;
    }

    public function visible(bool $visible = true): static
    {
        $this->hidden = ! $visible;

        return $this;
    }

    public function required(bool $required = true): static
    {
        $this->required = $required;

        return $this;
    }

    public function readOnly(bool $readOnly = true): static
    {
        $this->readonly = $readOnly;

        return $this;
    }

    public function disabled(bool $disabled = true): static
    {
        $this->disabled = $disabled;

        return $this;
    }

    public function value(mixed $value): static
    {
        if ($value instanceof Closure) {
            $this->valueResolver = $value;

            return $this;
        }

        $this->value = $value;
        $this->valueWasSet = true;

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
        return $this->value;
    }

    /**
     * @internal
     */
    public function isVisible(FormData $data): bool
    {
        return $this->hidden !== true && $this->allConditionsMatch('visible', $data);
    }

    /**
     * @internal
     */
    public function isRequired(FormData $data): bool
    {
        return $this->required === true || $this->anyConditionMatches('required', $data);
    }

    /**
     * @internal
     */
    public function isReadOnly(FormData $data): bool
    {
        return $this->readonly === true || $this->anyConditionMatches('readonly', $data);
    }

    /**
     * @internal
     */
    public function isDisabled(FormData $data): bool
    {
        return $this->disabled === true || $this->anyConditionMatches('disabled', $data);
    }

    /**
     * Visibility shows the field only when every condition in the group holds, so
     * an empty group defaults to visible.
     */
    private function allConditionsMatch(string $group, FormData $data): bool
    {
        return ($this->conditionSets[$group] ?? null)?->allMatch($data) ?? true;
    }

    /**
     * Required/readonly/disabled apply when any condition in the group holds, so
     * an empty group defaults to off.
     */
    private function anyConditionMatches(string $group, FormData $data): bool
    {
        return ($this->conditionSets[$group] ?? null)?->anyMatches($data) ?? false;
    }

    /**
     * @internal
     */
    public function hasValue(): bool
    {
        return $this->valueWasSet;
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

    private function makeCondition(string $field, mixed $operatorOrValue, mixed $value): Condition
    {
        if ($value === null && ! $operatorOrValue instanceof Op) {
            return new Condition($field, is_array($operatorOrValue) ? Op::In : Op::Equals, $operatorOrValue);
        }

        $operator = $operatorOrValue instanceof Op
            ? $operatorOrValue
            : Op::fromHuman((string) $operatorOrValue);

        return new Condition($field, $operator, $value);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function projectComputedProps(array $data): array
    {
        $conditions = [];

        foreach ($this->conditionSets as $group => $set) {
            $serialised = $set->jsonSerialize();

            if ($serialised !== []) {
                $conditions[$group] = $serialised;
            }
        }

        $this->conditions = $conditions === [] ? null : $conditions;

        $keys = [];

        foreach ($this->dependencies as $dependency) {
            foreach ($dependency['attributes'] as $attribute) {
                $keys[$attribute] = true;
            }
        }

        $this->dependsOnKeys = $keys === [] ? null : array_keys($keys);
        $this->dependsOnAny = $this->valueResolver !== null ? true : null;

        return $data;
    }
}
