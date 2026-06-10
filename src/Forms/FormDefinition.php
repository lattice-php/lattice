<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;
use Lattice\Lattice\Core\Concerns\CreatesToastMessages;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Contracts\ProvidesForm;
use Symfony\Component\HttpFoundation\Response;

abstract class FormDefinition extends Definition implements ProvidesForm
{
    use CreatesToastMessages;

    abstract public function definition(Form $form, Request $request): Form;

    abstract public function handle(Request $request): Response|Responsable;

    /**
     * @return array<string, mixed>
     */
    public function validate(Request $request): array
    {
        $data = FormData::fromRequest($request);
        $fields = $this->resolvedFields($request, $data);

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

            $fieldRules = $field->resolveRules($data, $request);

            if ($field->isRequired($data) && ! in_array('required', $fieldRules, true)) {
                array_unshift($fieldRules, 'required');
            }

            if ($fieldRules !== []) {
                $rules[$name] = $fieldRules;
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
     * Resolve the searchable options for a single field. The field's own resolver
     * owns the query, so this never touches an arbitrary model.
     *
     * @return array{options: array<int, array{label: string, value: string}>}
     */
    public function searchOptions(Request $request): array
    {
        $name = $request->string('_search')->toString();
        $query = $request->string('q')->toString();
        $data = FormData::fromRequest($request);

        $field = $this->buildForm($request)
            ->fields()
            ->first(fn (Field $field): bool => $field->name() === $name);

        abort_if($field === null, Response::HTTP_NOT_FOUND);
        abort_unless($field instanceof Select && $field->isSearchable(), Response::HTTP_UNPROCESSABLE_ENTITY);

        return ['options' => $field->resolveSearch($query, $data, $request)];
    }

    /**
     * @return array{fields: array<string, mixed>, values: array<string, mixed>}
     */
    public function resolveFields(Request $request): array
    {
        $data = FormData::fromRequest($request);
        $fields = [];
        $values = [];

        foreach ($this->buildForm($request)->fields() as $field) {
            if (! $field->isComputed()) {
                continue;
            }

            $field->applyResolution($data, $request);
            $fields[$field->name()] = $field;

            if ($field->hasResolvedValue()) {
                $values[$field->name()] = $field->resolvedValue();
            }
        }

        return ['fields' => $fields, 'values' => $values];
    }

    /**
     * Build the form and run each field's resolution pass (dependsOn closures, value resolvers)
     * so visibility, rules, and computed values reflect the current request data.
     *
     * @return Collection<int, Field>
     */
    protected function resolvedFields(Request $request, FormData $data): Collection
    {
        return $this->buildForm($request)
            ->fields()
            ->each(fn (Field $field) => $field->applyResolution($data, $request));
    }

    /**
     * Build this form's component tree for the current request.
     */
    protected function buildForm(Request $request): Form
    {
        return $this->definition(Form::make('form'), $request);
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
