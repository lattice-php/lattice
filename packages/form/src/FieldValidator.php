<?php
declare(strict_types=1);

namespace Lattice\Form;

use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;
use Lattice\Form\Components\Field;
use Lattice\Form\Components\RowsField;

/**
 * Single-pass validation for a list of form fields: resolves dependencies,
 * evaluates visibility/locked state, builds the rule set, runs one validator
 * (honoring precognition), and post-processes server/locked/cast values.
 *
 * Shared by FormDefinition and by actions that embed a form schema.
 */
final class FieldValidator
{
    /**
     * @param  iterable<int, Field>  $fields
     * @return array<string, mixed>
     */
    public function validate(iterable $fields, Request $request): array
    {
        $data = FormData::fromRequest($request);

        /** @var Collection<int, FormFieldInstance> $instances */
        $instances = collect(app(FormSchemaWalker::class)->instances($fields, $data))
            ->each(fn (FormFieldInstance $instance) => $instance->field->applyResolution($instance->scope, $request));

        $input = $request->all();
        $rules = [];
        $messages = [];
        $attributes = [];

        /** @var array<int, array{field: Field, path: string, visible: bool, serverValue: bool, locked: bool}> $plan */
        $plan = [];

        foreach ($instances as $instance) {
            $field = $instance->field;
            $path = $instance->path;
            $visible = $field->isVisible($instance->scope);
            $locked = $field->isReadOnly($instance->scope) || $field->isDisabled($instance->scope);
            $serverValue = $field->hasResolvedValue() || ($locked && $field->hasValue());

            $plan[] = [
                'field' => $field,
                'path' => $path,
                'visible' => $visible,
                'serverValue' => $serverValue,
                'locked' => $locked,
            ];

            if ($serverValue) {
                Arr::set($input, $path, $field->resolvedValue());
            } elseif (Arr::has($input, $path)) {
                // nestedRules() below builds dot-path rule keys that need $input already decoded.
                Arr::set($input, $path, $field->normalizeInput(Arr::get($input, $path)));
            } elseif ($field->fillsAbsentInput()) {
                // A DOM form submission of an unchecked checkbox posts no key at all.
                Arr::set($input, $path, $field->absentInput());
            }

            if (! $visible) {
                continue;
            }

            $fieldRules = $field->resolvedRulesWithRequired($instance->scope, $request);

            if ($fieldRules === [] && ! $serverValue) {
                $fieldRules = ['sometimes', 'nullable'];
            }

            if ($fieldRules !== [] && $instance->rowPath !== null && $instance->rowSiblingNames !== null) {
                $fieldRules = RowRuleReferences::rewrite($fieldRules, $instance->rowPath, $instance->rowSiblingNames);
            }

            if ($fieldRules !== []) {
                $rules[$path] = $fieldRules;
            }

            foreach ($field->nestedRules($instance->scope, $request) as $ruleKey => $ruleSet) {
                $rules[$this->nestedRulePath($ruleKey, $field->name(), $path)] = $ruleSet;
            }

            foreach ($field->messages() as $rule => $message) {
                $messages["{$path}.{$rule}"] = $message;
            }

            if (($label = $field->getLabel()) !== null) {
                $attributes[$path] = $label;
            }
        }

        $validated = $this->validator($input, $rules, $messages, $attributes, $request)->validate();

        foreach ($plan as ['field' => $field, 'path' => $path, 'visible' => $visible, 'serverValue' => $serverValue, 'locked' => $locked]) {
            if (! $visible) {
                Arr::forget($validated, $path);

                continue;
            }

            if ($serverValue) {
                Arr::set($validated, $path, $field->resolvedValue());

                continue;
            }

            if ($locked) {
                Arr::forget($validated, $path);

                continue;
            }

            if (Arr::has($validated, $path)) {
                $value = $field->castValue(Arr::get($validated, $path));

                if ($field instanceof RowsField) {
                    $value = $this->withoutRowIds($value);
                }

                Arr::set($validated, $path, $value);
            }
        }

        return $validated;
    }

    /**
     * A rows field's cast value carries the reserved rowId identity key on
     * every row for the wire/prefill path; handle() never needs it.
     */
    private function withoutRowIds(mixed $rows): mixed
    {
        if (! is_array($rows)) {
            return $rows;
        }

        return array_map(static function (mixed $row): mixed {
            if (is_array($row)) {
                unset($row[RowsField::ROW_ID]);
            }

            return $row;
        }, $rows);
    }

    private function nestedRulePath(string $ruleKey, string $name, string $path): string
    {
        if ($ruleKey === $name) {
            return $path;
        }

        if (str_starts_with($ruleKey, "{$name}.")) {
            return $path.substr($ruleKey, strlen($name));
        }

        return $ruleKey;
    }

    /**
     * @param  array<string, mixed>  $input
     * @param  array<string, array<int, mixed>>  $rules
     * @param  array<string, string>  $messages
     * @param  array<string, string>  $attributes
     */
    protected function validator(array $input, array $rules, array $messages, array $attributes, Request $request): Validator
    {
        $validator = app(ValidationFactory::class)->make($input, $rules, $messages, $attributes);

        if ($request->isPrecognitive()) {
            $validator->setRules(
                $request->filterPrecognitiveRules($validator->getRulesWithoutPlaceholders()),
            );
        }

        return $validator;
    }
}
