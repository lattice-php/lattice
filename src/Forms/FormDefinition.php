<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Bambamboole\Lattice\Components\Form\Field;
use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Concerns\CreatesToastMessages;
use Bambamboole\Lattice\Definition;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;
use Symfony\Component\HttpFoundation\Response;

abstract class FormDefinition extends Definition
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
            if ($field->hasResolvedValue()) {
                $input[$field->name()] = $field->resolvedValue();
            }
        }

        $validated = $this->validator($input, $this->ruleSet($fields, $data, $request), $request)->validate();

        foreach ($fields as $field) {
            if (! $field->isVisible($data)) {
                unset($validated[$field->name()]);

                continue;
            }

            if ($field->hasResolvedValue()) {
                $validated[$field->name()] = $field->resolvedValue();
            }
        }

        return $validated;
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
     * @param  array<string, mixed>  $input
     * @param  array<string, array<int, mixed>>  $rules
     */
    protected function validator(array $input, array $rules, Request $request): Validator
    {
        $validator = app(ValidationFactory::class)->make($input, $rules);

        if ($request->isPrecognitive()) {
            $validator->setRules(
                $request->filterPrecognitiveRules($validator->getRulesWithoutPlaceholders()),
            );
        }

        return $validator;
    }
}
