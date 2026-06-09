<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Bambamboole\Lattice\Core\Concerns\CreatesToastMessages;
use Bambamboole\Lattice\Core\Definition;
use Bambamboole\Lattice\Forms\Components\Field;
use Bambamboole\Lattice\Forms\Components\Form;
use Bambamboole\Lattice\Forms\Components\Select;
use Bambamboole\Lattice\Forms\Contracts\ProvidesForm;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;
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

        foreach ($fields as $field) {
            if ($this->usesServerValue($field, $data)) {
                $input[$field->name()] = $field->resolvedValue();
            }
        }

        $validator = $this->validator(
            $input,
            $this->ruleSet($fields, $data, $request),
            $this->messageSet($fields, $data),
            $this->attributeSet($fields, $data),
            $request,
        );

        $validated = $validator->validate();

        foreach ($fields as $field) {
            $name = $field->name();

            if (! $field->isVisible($data)) {
                unset($validated[$name]);

                continue;
            }

            if ($this->usesServerValue($field, $data)) {
                $validated[$name] = $field->resolvedValue();

                continue;
            }

            if ($field->isReadonly($data) || $field->isDisabled($data)) {
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

        $field = $this->definition(Form::make('form'), $request)
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

        foreach ($this->definition(Form::make('form'), $request)->fields() as $field) {
            if (! $field->isComputed()) {
                continue;
            }

            $field->applyResolution($data, $request);
            $fields[$field->name()] = $field->toArray();

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
        return $this->definition(Form::make('form'), $request)
            ->fields()
            ->each(fn (Field $field) => $field->applyResolution($data, $request));
    }

    /**
     * @param  Collection<int, Field>  $fields
     * @return array<string, array<int, mixed>>
     */
    private function ruleSet(Collection $fields, FormData $data, Request $request): array
    {
        return $fields
            ->filter(fn (Field $field): bool => $field->isVisible($data))
            ->mapWithKeys(function (Field $field) use ($data, $request): array {
                $rules = $field->resolveRules($data, $request);

                if ($field->isRequired($data) && ! in_array('required', $rules, true)) {
                    array_unshift($rules, 'required');
                }

                return [$field->name() => $rules];
            })
            ->filter(fn (array $rules): bool => $rules !== [])
            ->all();
    }

    /**
     * Custom validation messages keyed as "{field}.{rule}", collected from visible fields.
     *
     * @param  Collection<int, Field>  $fields
     * @return array<string, string>
     */
    private function messageSet(Collection $fields, FormData $data): array
    {
        $messages = [];

        foreach ($fields as $field) {
            if (! $field->isVisible($data)) {
                continue;
            }

            foreach ($field->messages() as $rule => $message) {
                $messages["{$field->name()}.{$rule}"] = $message;
            }
        }

        return $messages;
    }

    /**
     * Field labels used as human-friendly validation attribute names.
     *
     * @param  Collection<int, Field>  $fields
     * @return array<string, string>
     */
    private function attributeSet(Collection $fields, FormData $data): array
    {
        return $fields
            ->filter(fn (Field $field): bool => $field->isVisible($data) && $field->label() !== null)
            ->mapWithKeys(fn (Field $field): array => [$field->name() => (string) $field->label()])
            ->all();
    }

    /**
     * A field's value is authoritative server-side when it is computed (imperative value
     * closure) or when it is locked (readonly/disabled) and carries a declarative value.
     */
    private function usesServerValue(Field $field, FormData $data): bool
    {
        if ($field->hasResolvedValue()) {
            return true;
        }

        return ($field->isReadonly($data) || $field->isDisabled($data)) && $field->hasValue();
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
