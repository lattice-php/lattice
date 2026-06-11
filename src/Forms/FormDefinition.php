<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
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
        return app(FieldValidator::class)->validate(
            $this->buildForm($request)->fields(),
            $request,
        );
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
     * Build this form's component tree for the current request.
     */
    protected function buildForm(Request $request): Form
    {
        return $this->definition(Form::make('form'), $request);
    }
}
