<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\FormData;
use Symfony\Component\HttpFoundation\Response;

/**
 * Searchable-option and computed-field resolution against a set of form fields.
 * Shared by FormDefinition and form-bearing actions; the host supplies the
 * fields for the current request.
 */
trait ResolvesFormFields
{
    /**
     * The form fields to search and resolve against for the current request.
     *
     * @return Collection<int, Field>
     */
    abstract protected function formFields(Request $request): Collection;

    /**
     * Resolve the searchable options for a single field. The field's own resolver
     * owns the query, so this never touches an arbitrary model.
     *
     * @return array{options: list<Option>}
     */
    public function searchOptions(Request $request): array
    {
        $name = $request->string('_search')->toString();
        $query = $request->string('q')->toString();
        $data = FormData::fromRequest($request);

        $field = $this->formFields($request)
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

        foreach ($this->formFields($request) as $field) {
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
}
