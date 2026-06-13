<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;
use Lattice\Lattice\Forms\Components\Field;

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

        /** @var Collection<int, Field> $fields */
        $fields = collect($fields)->each(fn (Field $field) => $field->applyResolution($data, $request));

        $input = $request->all();
        $rules = [];
        $messages = [];
        $attributes = [];

        /** @var array<int, array{field: Field, name: string, visible: bool, serverValue: bool, locked: bool}> $plan */
        $plan = [];

        foreach ($fields as $field) {
            $name = $field->name();
            $visible = $field->isVisible($data);
            $locked = $field->isReadOnly($data) || $field->isDisabled($data);
            $serverValue = $field->hasResolvedValue() || ($locked && $field->hasValue());

            $plan[] = [
                'field' => $field,
                'name' => $name,
                'visible' => $visible,
                'serverValue' => $serverValue,
                'locked' => $locked,
            ];

            if ($serverValue) {
                $input[$name] = $field->resolvedValue();
            }

            if (! $visible) {
                continue;
            }

            $fieldRules = $field->resolvedRulesWithRequired($data, $request);

            if ($fieldRules !== []) {
                $rules[$name] = $fieldRules;
            }

            foreach ($field->nestedRules($data, $request) as $ruleKey => $ruleSet) {
                $rules[$ruleKey] = $ruleSet;
            }

            foreach ($field->messages() as $rule => $message) {
                $messages["{$name}.{$rule}"] = $message;
            }

            if (($label = $field->getLabel()) !== null) {
                $attributes[$name] = $label;
            }
        }

        $validated = $this->validator($input, $rules, $messages, $attributes, $request)->validate();

        foreach ($plan as ['field' => $field, 'name' => $name, 'visible' => $visible, 'serverValue' => $serverValue, 'locked' => $locked]) {
            if (! $visible) {
                unset($validated[$name]);

                continue;
            }

            if ($serverValue) {
                $validated[$name] = $field->resolvedValue();

                continue;
            }

            if ($locked) {
                unset($validated[$name]);

                continue;
            }

            if (array_key_exists($name, $validated)) {
                $validated[$name] = $field->castValue($validated[$name]);
            }
        }

        return $validated;
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
