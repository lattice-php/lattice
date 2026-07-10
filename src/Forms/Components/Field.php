<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Concerns\HasTooltip;
use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Forms\Conditions\Condition;
use Lattice\Lattice\Forms\Conditions\ConditionSet;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Support\Evaluation\EvaluationContext;

abstract class Field extends Component
{
    use HasTooltip;

    public string $name = '';

    public ?string $label = null;

    public ?string $helperText = null;

    public ColumnWidth $columnWidth = ColumnWidth::Md;

    public mixed $value = null;

    public bool $hidden = false;

    public bool $required = false;

    public bool $readOnly = false;

    public bool $disabled = false;

    /**
     * @var array{
     *     visible?: list<Condition>,
     *     required?: list<Condition>,
     *     readOnly?: list<Condition>,
     *     disabled?: list<Condition>,
     * }|null
     */
    public ?array $conditions = null;

    /**
     * @var array<int, string>|null
     */
    public ?array $dependsOnKeys = null;

    public bool $dependsOnAny = false;

    /**
     * Validation rules. Each entry is a rule (string/object) or a Closure that
     * returns additional rules. Rules accumulate across calls.
     *
     * @var array<int, mixed>
     */
    protected array $rules = [];

    /**
     * Conditional state rules keyed by intent (visible/required/readOnly/disabled).
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

    public bool $editablePrefill = false;

    /**
     * @var array<int, string>|null
     */
    public ?array $prefillResetOn = null;

    /**
     * @var array<int, string>|null
     */
    public ?array $prefillRefreshOn = null;

    protected ?Closure $prefillResolver = null;

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

    public function columnWidth(ColumnWidth $width): static
    {
        $this->columnWidth = $width;

        return $this;
    }

    /**
     * Descriptive text shown beneath the field.
     */
    public function helperText(string $helperText): static
    {
        $this->helperText = $helperText;

        return $this;
    }

    /**
     * Alias of helperText().
     */
    public function hint(string $hint): static
    {
        return $this->helperText($hint);
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
     * is resolved to additional rules at validation time via utility injection
     * (`$state`/`$get`/`$value`/`$component` plus any container-resolved type such
     * as `Request`). Calls accumulate.
     *
     * @param  array<int, mixed>|Closure  $rules
     */
    public function rules(array|Closure $rules): static
    {
        $this->rules = $rules instanceof Closure
            ? [...$this->rules, $rules]
            : [...$this->rules, ...$rules];

        return $this;
    }

    /**
     * Rules the field contributes intrinsically, before any added via rules().
     * Overridden by fields with a built-in constraint (e.g. a Choice limiting
     * its value to the configured options).
     *
     * @return array<int, mixed>
     */
    protected function defaultRules(): array
    {
        return [];
    }

    /**
     * @internal
     *
     * @return array<int, mixed>
     */
    public function resolveRules(FormData $data, Request $request): array
    {
        $context = $this->evaluationContext($data, $request);
        $resolved = $this->defaultRules();

        foreach ($this->rules as $rule) {
            if ($rule instanceof Closure) {
                $resolved = [...$resolved, ...Evaluate::resolve($rule, $context)];

                continue;
            }

            $resolved[] = $rule;
        }

        return array_values($resolved);
    }

    /**
     * The field's resolved rules with a leading `required` when the field is
     * required and doesn't already declare one. Shared by FieldValidator and by
     * fields that build rules for nested children (e.g. Repeater rows).
     *
     * @internal
     *
     * @return array<int, mixed>
     */
    public function resolvedRulesWithRequired(FormData $data, Request $request): array
    {
        $rules = $this->resolveRules($data, $request);

        if ($this->isRequired($data) && ! in_array('required', $rules, true)) {
            array_unshift($rules, 'required');
        }

        return $rules;
    }

    /**
     * Extra validation rule keys this field contributes beyond its own name
     * (e.g. a Repeater's `items.*.child` per-row rules). Merged by FieldValidator.
     *
     * @internal
     *
     * @return array<string, array<int, mixed>>
     */
    public function nestedRules(FormData $data, Request $request): array
    {
        return [];
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

        if (is_array($attributes)) {
            foreach ($attributes as $attribute) {
                $this->addCondition('visible', $attribute, $operatorOrValue, $value);
            }

            return $this;
        }

        return $this->addCondition('visible', $attributes, $operatorOrValue, $value);
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
        return $this->addCondition('readOnly', $field, $operatorOrValue, $value);
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
        $this->readOnly = $readOnly;

        return $this;
    }

    public function disabled(bool $disabled = true): static
    {
        $this->disabled = $disabled;

        return $this;
    }

    /**
     * Set the field's value. A non-Closure is a static value. A Closure is a
     * server resolver: read-only by default (authoritative — overwrites user
     * input on validate/submit), or an editable default when `editable: true`
     * (user-owned — applied as a suggestion the client may override).
     *
     * @param  array<int, string>  $resetOn  Deps that clear a manual override (bare = row-relative, `@x` = form-level).
     * @param  array<int, string>  $refreshOn  Deps that recompute only when not overridden.
     */
    public function value(mixed $value, bool $editable = false, array $resetOn = [], array $refreshOn = []): static
    {
        if ($value instanceof Closure) {
            if ($editable) {
                $this->prefillResolver = $value;
                $this->editablePrefill = true;
                $this->prefillResetOn = $resetOn === [] ? null : array_values($resetOn);
                $this->prefillRefreshOn = $refreshOn === [] ? null : array_values($refreshOn);

                return $this;
            }

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
        return $this->dependencies !== [] || $this->valueResolver instanceof Closure;
    }

    /**
     * @internal
     */
    public function hasPrefill(): bool
    {
        return $this->prefillResolver instanceof Closure;
    }

    /**
     * @internal
     */
    public function resolvePrefillValue(FormData $row, FormData $form, Request $request): mixed
    {
        assert($this->prefillResolver instanceof Closure);

        $context = $this->evaluationContext($row, $request)
            ->named('row', $row)
            ->named('form', $form);

        return Evaluate::resolve($this->prefillResolver, $context);
    }

    /**
     * @internal
     */
    public function applyResolution(FormData $data, Request $request): void
    {
        $this->resolving = true;

        $context = $this->evaluationContext($data, $request);

        foreach ($this->dependencies as $dependency) {
            Evaluate::resolve($dependency['callback'], $context);
        }

        if ($this->valueResolver instanceof Closure) {
            $this->value(Evaluate::resolve($this->valueResolver, $context));
        }

        $this->resolving = false;
    }

    /**
     * @internal
     */
    protected function evaluationContext(FormData $data, Request $request): EvaluationContext
    {
        return Evaluate::context()
            ->named('state', $data)
            ->named('get', fn (string $key, mixed $default = null): mixed => $data->get($key, $default))
            ->named('value', $data->get($this->name()))
            ->named('component', $this)
            ->typed(static::class, $this)
            ->typed(FormData::class, $data)
            ->typed(Request::class, $request);
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
        return ! $this->hidden && $this->allConditionsMatch('visible', $data);
    }

    /**
     * @internal
     */
    public function isRequired(FormData $data): bool
    {
        return $this->required || $this->anyConditionMatches('required', $data);
    }

    /**
     * @internal
     */
    public function isReadOnly(FormData $data): bool
    {
        return $this->readOnly || $this->anyConditionMatches('readOnly', $data);
    }

    /**
     * @internal
     */
    public function isDisabled(FormData $data): bool
    {
        return $this->disabled || $this->anyConditionMatches('disabled', $data);
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
     * Required/readOnly/disabled apply when any condition in the group holds, so
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
    public function hydrateState(mixed $value, ?FormData $form = null, ?Request $request = null): void {}

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
     * The conditions declared for one intent (visible/required/readOnly/disabled),
     * as the value objects that serialize to the field's `conditions` wire shape.
     *
     * @return list<Condition>
     */
    private function conditionsFor(string $intent): array
    {
        return ($this->conditionSets[$intent] ?? null)?->all() ?? [];
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        $props = parent::decorateProps($props);

        $conditions = array_filter([
            'visible' => $this->conditionsFor('visible'),
            'required' => $this->conditionsFor('required'),
            'readOnly' => $this->conditionsFor('readOnly'),
            'disabled' => $this->conditionsFor('disabled'),
        ], static fn (array $set): bool => $set !== []);

        $props['conditions'] = $conditions === [] ? null : $conditions;

        $keys = [];

        foreach ($this->dependencies as $dependency) {
            foreach ($dependency['attributes'] as $attribute) {
                $keys[$attribute] = true;
            }
        }

        $props['dependsOnKeys'] = $keys === [] ? null : array_keys($keys);
        $props['dependsOnAny'] = $this->valueResolver instanceof Closure;

        return $props;
    }
}
